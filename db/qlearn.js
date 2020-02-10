
var db = require('../db/db');
var fs = require('fs');

var Promise = require('bluebird');
var databaseName = process.env.CARTO_DB_NAME;

//other db functions
var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');
var dynamicDB = require('../db/dynamic');
var tileDB = require('../db/tileoscope');

var path = require('path');
var Chance = require('chance'); //for random weighted
var chance = new Chance();


var ALPHA = 0.001;
var LAMBDA = 0.95;

var ACTIONS = ['44_RB_C4_M0',
                '55_TeNoTeG_C8_M0',
                '66_BrNoBrG_C12_M0'];


var WEIGHTS = {
    '44_RB_C4_M0': 0,
    '55_TeNoTeG_C8_M0': 1 ,
    '66_BrNoBrG_C12_M0': 1.2
};

var STATE_LEN = 3;
// var REP_N = 300000; //CHI-PLAY
var REP_N = 30000;

var SEQ_HORIZON = 10; //how much ahead should I generate

//pick optimal for Tileoscope (online)
exports.generateQlearnOptimalSequenceTileoscopeOnline = function(main_code) {

    return new Promise(function(resolve, error) {

        //get tree from main code
        dynamicDB.getTreeRootFromCodeTileoscope(main_code).then(function(tree) {



            //first, fetch the table
            //A: If no table AND no paths: Random
            //B: If no table But paths: generate
            //C: If table and paths: update
            exports.fetchQTableByCode(main_code).then(function(Q){

                var func_fetch_paths = "getTileoscopePathsRecent";
                if (Q.length){
                    var last_update = Q[Q.length-1].last_updated;

                } else {
                    func_fetch_paths = "getTileoscopePaths";
                }

                console.log("Fetched: "+ Q.length + " Q-table entries");

                //get all paths relevant to that main_code
                tileDB[func_fetch_paths](main_code,last_update).then(function(tile_paths) {

                    console.log("Fetched: "+ tile_paths.length + " paths");


                    //if no paths and no table, we should generate a random sequence!
                    if (tile_paths.length == 0 && Q.length == 0) {

                        console.log("No table, no paths: random sequence");

                        func = "createUserSequenceFromTreeTileoscopeRandom";

                        dynamicDB[func](main_code).then(function(random_data){
                            resolve(random_data)

                        }, function (err) {

                            error({code: 'Problem with generating random sequence'});

                        })

                    } else if (tile_paths.length == 0 && Q.length > 0) {


                        console.log("have table, no paths: create without updating");


                        //if no paths, but we have table, then just spit sequence using table we have
                        var Q_format = convertQtableFormat(Q);

                        var res_seq = QlearnAlgorithmConstruct(Q_format,SEQ_HORIZON);

                        //convert sequence to comptible string for Tile-o-Scope
                        var seq_conv = res_seq.join('-');
                        var gen_obj = {
                            unique_code_main: main_code,
                            seq: seq_conv,
                            pool: tree[0].pool,
                            ignore_codes: tree[0].ignore_codes,
                            misc: tree[0].misc || "none",
                            active: 1,
                            method: "qlearnO"
                        };
                        var gen_list = [gen_obj];
                        dynamicDB.insertGeneticSequences2Tileoscope(gen_list).then(function(insert_data) {
                            //Send genetic id back
                            if (insert_data.insertId) {
                                resolve(
                                    {
                                        genetic_id:insert_data.insertId,
                                        seq:seq_conv,
                                        method:"qlearnO"
                                    });
                            } else if (insert_data.affectedRows > 0) {
                                resolve(0);
                            } else {
                                error({code: 'Problem with insertion'});
                            }


                        },function(err){

                            console.log("Error getting paths for main code:" + main_code);
                            error(err)

                        });



                    }

                    else {
                        //QLEARN FUNCTION HERE should return the sequence

                        var Q_format = convertQtableFormat(Q);

                        exports.QlearnAlgorithm(tile_paths,main_code,Q_format).then(function(res_seq){

                            //convert sequence to comptible string for Tile-o-Scope
                            var seq_conv = res_seq.join('-');
                            var gen_obj = {
                                unique_code_main: main_code,
                                seq: seq_conv,
                                pool: tree[0].pool,
                                ignore_codes: tree[0].ignore_codes,
                                misc: tree[0].misc || "none",
                                active: 1,
                                method: "qlearnO"
                            };
                            var gen_list = [gen_obj];
                            dynamicDB.insertGeneticSequences2Tileoscope(gen_list).then(function(insert_data) {
                                //Send genetic id back
                                if (insert_data.insertId) {
                                    resolve(
                                        {
                                            genetic_id:insert_data.insertId,
                                            seq:seq_conv,
                                            method:"qlearnO"
                                        });
                                } else if (insert_data.affectedRows > 0) {
                                    resolve(0);
                                } else {
                                    error({code: 'Problem with insertion'});
                                }


                            },function(err){

                                console.log("Error getting paths for main code:" + main_code);
                                error(err)

                            });

                        },function(err){

                            console.log("Error getting paths for main code:");
                            console.log(err)
                            error(err)

                        })
                    }
                });

            }, function(err){
                console.log("Error fetching Qtable")
                error(err)
            })




        },function(err){
            error(err)

        })
    });
};



//update q-learn table entry (one)
exports.updateQlearnTableOne = function(main_code,q_key,q_value) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var unique_code_main = main_code;
        var kk = q_key.split('|');
        //key is state | action
        var q_action = kk[1];
        var q_state = kk[0];
        var q_id = 0;
        if (kk.length == 3){
            q_id = parseInt(kk[2])
        }

        //if id is undefined, we do simple insert

        if (q_id == 0) {

            console.log("Will insert:");
            console.log(unique_code_main, q_state, q_action, parseInt(q_value))

            connection.queryAsync('INSERT INTO tileoscope_qtable (unique_code_main, q_state, q_action, q_value) VALUES(?,?,?,?) ',[unique_code_main, q_state, q_action, parseInt(q_value)]).then(
                function(data) {
                    if (data.insertId) {
                        resolve(data.affectedRows);
                    } else {
                        error({code: 'Problem with inserting new qtable entry'});
                    }
                }, function(err) {
                    error(err);
                });

        } else {

            //console.log("Will update:");
            console.log(unique_code_main, q_state, q_action, parseInt(q_value),q_id);
            connection.queryAsync('update tileoscope_qtable set q_value=? where id=?',[parseInt(q_value),q_id]).then(
                function(data) {

                    resolve(data)

                }, function(err) {
                    error(err);
                });
        }


    });
};



//update q-learn table entry
exports.updateQlearnTableAll = function(main_code,update_keys, q_table) {

    return new Promise(function (resolve, error) {

        //make an update on the table for each entry that needs update
        var pArr = [];

        console.log(update_keys);

        update_keys.forEach(function (item) {

            var p = exports.updateQlearnTableOne(main_code,item,q_table[item]);
            p.catch(function (err) {
               // console.log("Error updating qtable entry");
               // console.log(err)
            });
            pArr.push(p);
        });

        Promise.all(pArr).then(function (data) {

            //perhaps resolve with how many actually got updated
            resolve(data.length);

        }, function (err) {

            console.log(err);
            error(-1);

        });
    });

}



//fetch from table and re-format
exports.fetchQTableByCode = function(unique_code_main) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_qtable where unique_code_main=? order by UNIX_TIMESTAMP(last_updated)',[unique_code_main]).then(
            function(data) {
                resolve(data)
            }, function(err) {
                error(err);
            });
    });
};


// qlearn core-algorithm: chi-play 2019 adaptation

exports.QlearnAlgorithm = function(player_paths,main_code, Q) {

    return new Promise(function (resolve, error) {

        //player paths have all the paths
        //player_paths is an array of objects where
        //each row is {seq: ... ,
        //  tiles_collected: ... ,
        // times_completed: ... , number_moves: ...}


        //if we come in with undefined Q or empty one
        if (Q == undefined || Q.length == 0){
            Q = {};
        }


        // array that keeps track of how many entries in table need to be updated
        var update_keys_array = [];

        //TODO: This REP_N is killing us, we need to be able to adjust based on something

        for (var i = 0; i < REP_N; i++) {

            //pick a random path from all players
            var rand_pos = randomInt(0, player_paths.length - 1);
            var rand_traj_raw = player_paths[rand_pos];
            //data is in string format separated by commas. convert to array
            var rand_traj_seq = rand_traj_raw.seq.split('-');
            var rand_traj_tiles = rand_traj_raw.tiles_collected.split('-');

            //pick our example: it should be in the form of
            // state (empty, 1,2...STATE LEN),
            // action is the one right after
            // value is the value of the action
            //so we want to pick a point, then get from that point up to -STATE_LEN + 1 if possible


            //pick a random subseq from the sequences:
            // first pick the point to end
            var rand_point_end = randomInt(0, rand_traj_seq.length - 1);
            //then pick the point to start by going back STATE LEN times
            var rand_point_start = Math.max(0, rand_point_end - STATE_LEN );


            //js note: slice ends at, but does not include last argument. so we need +1
            var example_seq =  rand_traj_seq.slice(rand_point_start,rand_point_end+1);
            var example_tiles_c =  rand_traj_tiles.slice(rand_point_start,rand_point_end+1);


            //next state is going to be one step after. but if we picked the end, then they quit, so X
            var next_state = "";
            if (rand_point_end == rand_traj_seq.length - 1) {
                next_state = "X";
            } else {
                next_state_arr = example_seq.slice(rand_point_start+1,rand_point_end+1);
                next_state = next_state_arr.join(',')
            }

            // action is going to be last item on what we got, value is going to be its tiles
            //everything else will be the state
            //pop the last item
            var action = example_seq.pop();
            var collected = parseInt(example_tiles_c.pop());
            var value = collected *  WEIGHTS[action];
            var state = example_seq.join('-');
            //key is going to be state | action
            var key = state + "|" + action;

            //we need the id in here: first search if there is a partial key, if there is then update key with its id
            //the reason we need the id is that we cannot have unique index in mySQL with state (text instead of varchar, can be arbitrarily long)
            //so we encode the id in the key so that we can pass that information when updating the q-table, so we can catch the duplicates correctly
            var has_key = Object.keys(Q).filter(function(item, index) {
                return item.indexOf(key + "|") == 0;
            });

            if (has_key.length){
                key = has_key[0]
            }


            //if key not in Q then init it
            if (! Q.hasOwnProperty(key)) {
                Q[key] = 0
            }
            //update Qlearn table
            var max_next_Q = -99.0;
            ACTIONS.forEach(function(try_act){

                var try_key = next_state + "|" + try_act;
                var try_Q = 0.0;
                if (Q.hasOwnProperty(try_key)){
                    try_Q = Q[try_key]
                }
                max_next_Q = Math.max(try_Q,max_next_Q);
            });

            //update Q[key]
            Q[key] = (1.0 - ALPHA) * Q[key] + ALPHA * (value + LAMBDA * max_next_Q)
            //keep track that this needed update
            if (update_keys_array.indexOf(key) == -1) {
                update_keys_array.push(key);
            }

        }

        //order them ascending:


        console.log("Have to update " + update_keys_array.length.toString() + " entries");

        //update Q-table first
        exports.updateQlearnTableAll(main_code,update_keys_array.sort(),Q).then(function (up) {

            console.log("Updated " + up.toString() + " entries");
            //once the Q-table is constructed, generate the seq and return
            var new_seq = QlearnAlgorithmConstruct(Q,SEQ_HORIZON);
            resolve(new_seq);

        }, function (err) {

            error(err)

        })




    })

};



function convertQtableFormat(data){
    var q_table = {};
    //make them in the form we need Q[key] = value
    // since we cannot have unique index with state, we will use the id as a shorthand, we need this info passed somehow
    data.forEach(function(item){
        var key = item.q_state + "|" + item.q_action + "|" + item.id;
        q_table[key] = item.q_value;

    });
    return(q_table)
}


//given Q table, construct a sequence of size n
function QlearnAlgorithmConstruct(Q,size_n) {

    var pth = [];

    for (var i = 0; i < size_n; i++) {

        var state = "";
        var state_arr = [];

        //if the state is bigger than STATE LEN, get the last 3 items
        if (pth.length > STATE_LEN){
            state_arr = pth.slice(-STATE_LEN);
        } else {
            state_arr = pth;
        }

        if (state_arr.length == 0){
            state = ""
        } else {
            state = state_arr.join("-")
        }

        var max_act = "";
        var max_Q = -99.0;
        var pick_w = [];
        var pick_act = [];
        var norm_w = 0;
        ACTIONS.forEach(function(try_act){
            var try_key = state + "|" + try_act;
            var try_Q = 0.0;

            //must add key in it
            var has_key = Object.keys(Q).filter(function(item, index) {
                return item.indexOf(try_key + "|") == 0;
            });

            if (has_key.length){
                try_key = has_key[0]
            }

            if (Q.hasOwnProperty(try_key)){
                try_Q = parseFloat(Q[try_key]);
                norm_w = norm_w + try_Q*try_Q;
                pick_w.push(try_Q*try_Q);
                pick_act.push(try_act);
            }
        });
        //normalize weights of choices
        var pick_w_norm = [];
        for (var j = 0; j < pick_w.length; j++) {
            pick_w_norm[j] = pick_w[j] *1.0 / norm_w

        }
        // pick random weighted
        max_act = chance.weighted(pick_act, pick_w_norm);
        pth.push(max_act);

    }
    //return path in array form
    return(pth);



};


//return random integer [min,max]
function randomInt(min,max){
    return (Math.floor(Math.random() * (max - min + 1) ) + min);
}