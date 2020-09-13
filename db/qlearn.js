
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


// var ALPHA = 0.001;
//var ALPHA = 0.01;
var ALPHA = 0.1;
var LAMBDA = 0.95;
var SOFTMX = true; // whether to use softmax vs squared

var MISTAKE_SWITCH = 4; //was 2

// var ACTIONS = ['44_CaDo_C4_M0',
//                 '55_TeNoTeG_C8_M0',
//                 '66_BrNoBrG_C12_M0',
//                 'CAIRNM'
//                 ];
var ACTIONS = ['44_CaDo_C10_M0',
    '55_TeNoTeG_C10_M0',
    '66_BrNoBrG_C10_M0',
    'CAIRNM'
];


var WEIGHTS = {
    'CAIRNM': 0,
    '44_RB_C4_M0': 0.5, //replace with cats dogs
    '44_RB_C10_M0': 0.5, //replace with cats dogs
    '44_CaDo_C4_M0': 0.5,
    '44_CaDo_C10_M0': 0.5,
    '55_TeNoTeG_C8_M0': 1 ,
    '55_TeNoTeG_C10_M0': 1 ,
    '66_BrNoBrG_C12_M0': 1.2,
    '66_BrNoBrG_C10_M0': 1.2

};



var STATE_LEN = 2;
// var REP_N = 300000; //CHI-PLAY
var REP_N = 1; //not used anymore

var SEQ_HORIZON = 25; //how much ahead should I generate




//pick optimal for Tileoscope (old version, non adaptive)
//TODO: RETIRE
exports.generateQlearnOptimalSequenceTileoscopeOld = function(main_code,train_id) {

    return new Promise(function(resolve, error) {

        //get tree from main code
        dynamicDB.getTreeRootFromCodeTileoscope(main_code).then(function(tree) {

            console.log("Fetching paths from: ",train_id);
            //then get paths from designated random train hit:
            tileDB.getTileoscopePaths(train_id).then(function(tile_paths) {

                    console.log("Fetched: " + tile_paths.length + " paths.");

                    //QLEARN FUNCTION HERE should return the sequence
                    exports.QlearnAlgorithmStatic(main_code,tile_paths).then(function(res_seq){

                        //convert sequence to comptible string for Tile-o-Scope
                        var seq_conv = res_seq.join('-');
                        var gen_obj = {
                            unique_code_main: main_code,
                            seq: seq_conv,
                            pool: tree[0].pool,
                            ignore_codes: tree[0].ignore_codes,
                            misc: tree[0].misc || "none",
                            active: 1,
                            method: "qlearn"
                        };
                        var gen_list = [gen_obj];
                        dynamicDB.insertGeneticSequences2Tileoscope(gen_list).then(function(insert_data) {
                            //Send genetic id back
                            if (insert_data.insertId) {
                                resolve(
                                    {
                                        genetic_id:insert_data.insertId,
                                        seq:seq_conv,
                                        method:"qlearn"
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

            });


        },function(err){
            error(err)

        })
    });
};




//function to generate a sequence based on static Q-learn
exports.generateSequenceQlearnStatic = function(main_code,train_id,user_id) {

    return new Promise(function(resolve, error) {

        exports.fetchQTableByCode(main_code,"static").then(function(Q){
            //if table exists, then just format Q-table and construct sequence
            if (Q.length > 0) {

                //format from db format to object:
                var Q_format = exports.convertQtableFormat(Q);
                var res_seq = exports.QlearnAlgorithmConstruct(Q_format,SEQ_HORIZON,"N","");
                var seq_conv = res_seq.join('-');
                //send seq data
                resolve(
                    {
                        genetic_id:-1, //not stored
                        seq:seq_conv,
                        method:"qlearn"
                    });

            } else {
                //generate first then construct
                console.log("No Qtable. Generating first");
                exports.generateQTableStatic(main_code,train_id).then(function(c_q){
                    var res_seq = exports.QlearnAlgorithmConstruct(c_q,SEQ_HORIZON,"N","");
                    var seq_conv = res_seq.join('-');
                    resolve(
                        {
                            genetic_id:-1, //not stored
                            seq:seq_conv,
                            method:"qlearn"
                        });


                },function(err){
                    console.log("Error constructing static Qlearn table");
                    console.log(err);
                    error(err);
                })

            }

        }, function(err){
            console.log("Error fetching static Qlearn table.");
            console.log(err);
            error(err);

        })
    });
};


//function to generate the Static Q-table from training data
exports.generateQTableStatic = function(main_code,train_id) {

    return new Promise(function(resolve, error) {

         console.log("Fetching paths from: ",train_id);
            //then get paths from designated random train hit:
            tileDB.getTileoscopePaths(train_id).then(function(tile_paths) {

                console.log("Fetched: " + tile_paths.length + " paths.");

                //QLEARN FUNCTION HERE should return the Q-table
                exports.QlearnAlgorithmStatic(main_code,tile_paths).then(function(Q){

                    //order them ascending:
                    var update_keys_array = Object.keys(Q);
                    console.log("Have to insert " + update_keys_array.length.toString() + " entries");

                    //store Q-table for static
                    exports.updateQlearnTableAll(main_code,update_keys_array.sort(),Q,"static").then(function (up) {
                        console.log("Inserted " + up.toString() + " entries");
                        //once the Q-table is constructed, return Q-table
                        resolve(Q);
                    }, function (err) {
                        error(err)
                    })
                },function(err){
                    console.log("Error getting paths from training to build Q-table static");
                    console.log(err);
                    error(err)
                })

            });


    });
};



//generate Qtable from training data
exports.generateQTableAdaptive = function(main_code,train_id) {

    return new Promise(function(resolve, error) {

        //get the paths from training:
        tileDB.getTileoscopePaths(train_id).then(function(tile_paths) {

            console.log("Fetched: " + tile_paths.length + " paths.");
            //generate Qtable:
            exports.QlearnAlgorithm(tile_paths,main_code,{},-1).then(function(res_seq){

                //convert sequence to comptible string for Tile-o-Scope
                var seq_conv = res_seq.join('-');
                resolve(
                    {
                        genetic_id:-1, //we didn't store it
                        seq:seq_conv,
                        method:"qlearnO"
                    });

            },function(err){

                console.log("Error generating Q-table adaptive for code: " + main_code);
                console.log(err);
                error(err)

            })


        },function(err){
          console.log("Error fetching paths for: " + train_id);
          console.log(err);
          error(err);
        })

    });
};








//pick optimal for Tileoscope (online)
exports.generateQlearnOptimalSequenceTileoscopeOnline = function(main_code, player_mistakes,user_id) {

    return new Promise(function(resolve, error) {

        var Q_format ={};

        //get tree from main code
        exports.fetchPlayerPath(user_id).then(function(user_path) {

           //Step 1: get table
            exports.fetchQTableByCode(main_code,"adaptive").then(function(Q){


                console.log("Fetched: "+ Q.length + " Q-table entries");

                //get all paths relevant to that main_code
                tileDB.getTileoscopePathsQlearnO(main_code).then(function(tile_paths) {
                //tileDB[func_fetch_paths](main_code,last_update).then(function(tile_paths) {

                    console.log("Fetched: "+ tile_paths.length + " paths");


                    //if no paths, we should generate a random sequence!
                    if (tile_paths.length == 0 ) {


                        console.log("no paths: create without updating");
                        if (player_mistakes === -1){
                            console.log("We are at the very start of play. Just get what we have")
                        }


                        //if no paths, but we have table, then just spit sequence using table we have
                        if (Q.length > 0) {
                            Q_format = exports.convertQtableFormat(Q);
                        }

                        //get next level
                        var res_seq = exports.QlearnAlgorithmConstruct(Q_format,1,exports.encodeMistakes(player_mistakes),user_path);

                        //convert sequence to comptible string for Tile-o-Scope
                        var seq_conv = res_seq.join('-');
                        resolve(
                            {
                                genetic_id:-1,
                                seq:seq_conv,
                                method:"qlearnO"
                            });

                    } else {
                        //QLEARN FUNCTION HERE should return the sequence

                        Q_format = exports.convertQtableFormat(Q);

                        exports.QlearnAlgorithm(tile_paths,main_code,Q_format,player_mistakes,user_path).then(function(res_seq){

                            //convert sequence to comptible string for Tile-o-Scope
                            var seq_conv = res_seq.join('-');
                            resolve(
                                {
                                    genetic_id:-1, //not storing this, we don't need it now that we have the paths table
                                    seq:seq_conv,
                                    method:"qlearnO"
                                });

                        },function(err){

                            console.log("Error getting paths for main code:");
                            console.log(err)
                            error(err)

                        })
                    }
                });

            }, function(err){
                console.log("Error fetching Qtable");
                error(err)
            })




        },function(err){
            console.log("Could not get user path")
            error(err)

        })
    });
};






//update q-learn table entry (one)
exports.updateQlearnTableOne = function(main_code,q_key,q_value,mode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        console.log("Got: " + q_key);
        var unique_code_main = main_code;
        var kk = q_key.split('|');
        //key is state | action
        var q_action = kk[1];
        var q_state = kk[0];
        var q_player_mistakes = q_state.split('/')[1] || 'N'; //if we are in the static version, then we don't have performance
        var q_id = 0;
        if (kk.length === 3){
            q_id = parseInt(kk[2])
        }

        //if id is undefined, we do simple insert

        if (q_id === 0) {

            console.log("Will insert:");
            console.log(unique_code_main, q_state, q_action, q_player_mistakes, parseFloat(q_value))

            connection.queryAsync('INSERT INTO tileoscope_qtable (unique_code_main, q_state, q_action,q_player_mistakes, q_value,mode) VALUES(?,?,?,?,?,?) ',[unique_code_main, q_state, q_action,q_player_mistakes, parseFloat(q_value),mode]).then(
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

            console.log("Will update:");
            console.log(unique_code_main, q_state, q_action, parseFloat(q_value),q_id);
            connection.queryAsync('update tileoscope_qtable set q_value=? where id=?',[parseFloat(q_value),q_id]).then(
                function(data) {

                    resolve(data)

                }, function(err) {
                    error(err);
                });
        }


    });
};



//update q-learn table entry
exports.updateQlearnTableAll = function(main_code,update_keys, q_table,mode) {

    return new Promise(function (resolve, error) {

        //make an update on the table for each entry that needs update
        var pArr = [];


        update_keys.forEach(function (item) {

            var p = exports.updateQlearnTableOne(main_code,item,q_table[item],mode);
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
exports.fetchQTableByCode = function(unique_code_main,mode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_qtable where unique_code_main=? and mode=? order by UNIX_TIMESTAMP(last_updated)',[unique_code_main,mode]).then(
            function(data) {
                resolve(data)
            }, function(err) {
                error(err);
            });
    });
};


// qlearn core-algorithm: adaptive
exports.QlearnAlgorithm = function(player_paths,main_code, Q, player_mistakes,main_player_path) {

    return new Promise(function (resolve, error) {


        //if we come in with undefined Q or empty one
        if (Q == undefined || Q.length == 0){
            Q = {};
        }
        // console.log("Qtable before");
        // console.log(Q);


        // array that keeps track of how many entries in table need to be updated
        var update_keys_array = [];

        //for (var i = 0; i < REP_N; i++) {
        player_paths.forEach(function(ppt) {


            //convert to all keys we have to update
            var q_to_push = convertPathToKeys(ppt,"adaptive");
            q_to_push.forEach(function(q_update){
                //make the key as state | action Q[key] -> Q[state,action]
                var key = q_update.state + "|" + q_update.action;
                var next_state = q_update.next_state;
                var value = q_update.value;

                //console.log("Prop key: " + key)

                //we need the id in here: first search if there is a partial key, if there is then update key with its id
                //the reason we need the id is that we cannot have unique index in mySQL with state (text instead of varchar, can be arbitrarily long)
                //so we encode the id in the key so that we can pass that information when updating the q-table, so we can catch the duplicates correctly
                var has_key = Object.keys(Q).filter(function(item, index) {
                    return item.indexOf(key + "|") == 0;
                });

                if (has_key.length){
                    key = has_key[0]
                    //console.log("Id key: " + key)
                }


                //if key not in Q then init it
                if (! Q.hasOwnProperty(key)) {
                    Q[key] = 0
                    //console.log("No key! init it")
                }
                //update Qlearn table
                var max_next_Q = -99.0;
                ACTIONS.forEach(function(try_act){

                    var try_key = next_state + "|" + try_act ;
                    var try_Q = 0.0;
                    var has_key_try = Object.keys(Q).filter(function(item, index) {
                        return item.indexOf(try_key + "|") == 0;
                    });

                    if (has_key_try.length){
                        try_key = has_key_try[0]
                        //console.log("Id key try: " + try_key)
                    }
                    if (Q.hasOwnProperty(try_key)){
                        try_Q = Q[try_key]
                    }
                    //console.log("Try key: " + try_key)
                    //console.log("Try key valu: " + try_Q );
                    max_next_Q = Math.max(try_Q,max_next_Q);
                });

                //update Q[key]
                Q[key] = (1.0 - ALPHA) * Q[key] + ALPHA * (value + LAMBDA * max_next_Q);
                //console.log("Updated: " + Q[key])
                //keep track that this needed update
                if (update_keys_array.indexOf(key) == -1) {
                    update_keys_array.push(key);
                }


            }) //end of paths from player

            //now that we have done all updates for this player, we must update the user_index in the db!
            var u_path = ppt.seq.split('-');
            exports.updatePlayerPathIndex(ppt.id,u_path.length);


        }); //end of q table generation


        //order them ascending:
        console.log("Have to update " + update_keys_array.length.toString() + " entries");

        //update Q-table first
        exports.updateQlearnTableAll(main_code,update_keys_array.sort(),Q,"adaptive").then(function (up) {

            console.log("Updated " + up.toString() + " entries");
            //once the Q-table is constructed, generate the seq and return
            //encode current player mistakes: will use in generating path
            var p_mc = exports.encodeMistakes(player_mistakes);
            var new_seq = exports.QlearnAlgorithmConstruct(Q,1,p_mc,main_player_path);
            resolve(new_seq);
        }, function (err) {
            error(err)
        })




    })

};


exports.QlearnAlgorithmStatic = function(main_code,player_paths){
    return new Promise(function (resolve, error) {


        var Q = {};
        //for (var i = 0; i < REP_N; i++) {
        player_paths.forEach(function(ppt) {

            //convert to all keys we have to update
            var q_to_push = convertPathToKeys(ppt,"static");
            q_to_push.forEach(function(q_update){
                //make the key as state | action Q[key] -> Q[state,action]
                var key = q_update.state + "|" + q_update.action;
                var next_state = q_update.next_state;
                var value = q_update.value;



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
                Q[key] = (1.0 - ALPHA) * Q[key] + ALPHA * (value + LAMBDA * max_next_Q);


            }) //end of paths from player

        }); //end of q table generation

        //return the Q-table
        resolve(Q)

    })
};


//update user path
exports.updatePlayerPathIndex = function(path_id,new_index) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('update tileoscope_paths set user_index=? where id=?',[new_index,path_id]).then(
            function(data) {
                resolve(data)
            }, function(err) {
                error(err);
            });
    });
};

//fetch user path
exports.fetchPlayerPath = function(user_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select seq from tileoscope_paths where user_id=? limit 1 ',[user_id]).then(
            function(data) {
                if (data.length == 0) {
                    resolve("")
                } else {
                    resolve(data[0].seq)
                }
            }, function(err) {
                error(err);
            });
    });
};

//how many people in each condition of the hit based on data from moves
exports.getConditionDistributions = function(hit_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select t.method, count(*) from (select DISTINCT user_id,hit_id,JSON_EXTRACT(response, \'$.method\') as method from tileoscope_moves where hit_id=?) as t group by method;',[hit_id]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

//update user path
exports.updatePlayerQuit = function(path_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('update tileoscope_paths set user_quit=1 where id=?',[path_id]).then(
            function(data) {
                resolve(data)
            }, function(err) {
                error(err);
            });
    });
};




exports.convertQtableFormat = function(data){
    var q_table = {};
    //make them in the form we need Q[key] = value
    // since we cannot have unique index with state, we will use the id as a shorthand, we need this info passed somehow
    //we need the unique index to update things in mysql
    data.forEach(function(item){
        var key = item.q_state + "|" + item.q_action + "|"  +  item.id;
        q_table[key] = item.q_value;

    });
    return(q_table)
}


function convertQtableFormatNoKey(data){
    var q_table = {};
    //make them in the form we need Q[key] = value
    // since we cannot have unique index with state, we will use the id as a shorthand, we need this info passed somehow
    //we need the unique index to update things in mysql
    data.forEach(function(item){
        var key = item.q_state + "|" + item.q_action
        q_table[key] = item.q_value;

    });
    return(q_table)
}


//given Q table, construct a sequence of size n
//if static, p_mistakes is N everywhere
exports.QlearnAlgorithmConstruct = function(Q,size_n,p_mistakes,user_path) {


    if (user_path === undefined){
        user_path = ''
    }

    var pth = [];
    if (user_path.length > 0) {
        pth = user_path.split('-');
    }

    for (var i = 0; i < size_n; i++) {

        var state = "";
        var state_arr = [];

        console.log("Path:");
        console.log(pth);

        //if the state is bigger than STATE LEN, get the last STATE-LEN items
        if (pth.length > STATE_LEN){
            state_arr = pth.slice(-STATE_LEN);
        } else {
            state_arr = pth;
        }


        if (state_arr.length === 0){
            state = ""
        } else {
            state = state_arr.join("-") + "/" + p_mistakes
        }


        var max_act = "";
        // var max_Q = -99.0;
        var tq_n = 0;
        var pick_w = [];
        var pick_act = [];
        var norm_w = 0;
        var not_selected = [];
        ACTIONS.forEach(function(try_act){
            var try_key = state + "|" + try_act ;
            var try_Q = 0;

            //must add key in it
            var has_key = Object.keys(Q).filter(function(item, index) {
                return item.indexOf(try_key + "|") == 0;
            });

            if (has_key.length){
                try_key = has_key[0]
            }

            if (Q.hasOwnProperty(try_key)) {
                try_Q = parseFloat(Q[try_key]);
            } else{
                not_selected.push(try_act)
            }
            //pick the unused ones



            //if softmax, then use softmax function to normalize weights
            // else used squared value of function
            if (SOFTMX){
                tq_n = Math.exp(try_Q);
            } else {
                tq_n = Math.pow(try_Q, 2);
            }

            norm_w = norm_w + tq_n;
            pick_w.push(tq_n);
            pick_act.push(try_act);
        });

        // console.log(pick_w);
        // console.log(pick_act);

        //normalize weights of choices
        var pick_w_norm = [];
        for (var j = 0; j < pick_w.length; j++) {
            if (norm_w > 0) {
                pick_w_norm[j] = pick_w[j] *1.0 / norm_w
            } else {
                pick_w_norm[j] = 1.0
            }
        }

        //if we have items that we havent selected, then pick one of them
        if(not_selected.length){
            // pick one of the not selected at random
            console.log("Will pick from: " + not_selected)
            max_act = chance.pickone(not_selected);
        } else {
            // pick random weighted
            console.log("Will pick random weighted")
            max_act = chance.weighted(pick_act, pick_w_norm);
        }

        //max_act = chance.weighted(pick_act, pick_w_norm);


        console.log("Next pick: " + max_act)
        pth.push(max_act);

    }
    //return path in array form
    return(pth);

};




//Alternative way of updating that player ended round. Not currently used
exports.updatePlayerEnded = function(user_id,hit_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update tileoscope_paths set seq = CONCAT(seq, \'-X\') where user_id=? and hit_id=? ', [user_id,hit_id])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};





//return random integer [min,max]
function randomInt(min,max){
    return (Math.floor(Math.random() * (max - min + 1) ) + min);
}

exports.encodeMistakes = function(num_m){
    //if n = 0 : G
    //if n < 2 : B
    //if n > 2 :U
    //if n = -1 (undefined) : N
    if (num_m == -1){
        return 'N'
    } else if (num_m == 0) {
        return 'G'
    } else if ( num_m < MISTAKE_SWITCH) {
        return 'B'
    } else {
        return 'U'
    }
}



function convertPathToKeys(rand_traj_raw,mode) {

    //for a given user path, convert to array of objects:
    // { state: , action: , value: , next_state}

    //console.log("Path: " + rand_traj_raw.seq);
    //console.log("Collected: " + rand_traj_raw.tiles_collected);


    var rand_traj_seq = rand_traj_raw.seq.split('-');
    var rand_traj_tiles = rand_traj_raw.tiles_collected.split('-');
    var rand_traj_mistakes = rand_traj_raw.number_mistakes.split('-');

    //this is what is the first thing we must see
    var user_index = rand_traj_raw.user_index || 0;

    var path_quit = rand_traj_raw.user_quit || 0;

    //console.log("Quit: " + path_quit + " index: "  + user_index);

    // console.log("Fullp path:")
    // console.log(rand_traj_seq);


    var q_array_path = [];
    var pos = rand_traj_seq.length - 1; //start from end
    while (pos  >= user_index) {
        for (var i = 0; i <= STATE_LEN; i++) {

            var start_pos = pos - i;
            if (start_pos < 0) {
                // start_pos = 0
                continue;
            }
            var example_seq = rand_traj_seq.slice(start_pos, pos + 1);
            var example_tiles_c = rand_traj_tiles.slice(start_pos, pos + 1);
            var example_mistakes = rand_traj_mistakes.slice(start_pos, pos + 1);
            // console.log("Example:")
            // console.log(example_seq);

            if (example_seq.length) {
                var action = example_seq.pop();
                //console.log("Action: " + action)
                var next_mistake = parseInt(example_mistakes.pop());


                var collected = parseInt(example_tiles_c.pop());
                var value = collected * WEIGHTS[action];

                var state = example_seq.join('-');

                //state is history + performance we were
                if (state !== "") {

                    var perf = exports.encodeMistakes(parseInt(example_mistakes.pop()));
                    //if in static, disregard user performance in state
                    if (mode === "static"){
                        perf = "N";
                    }
                    state = state + "/" + perf
                }

                // console.log("State: " + state);


                //next state is going to be one step after. but if we picked the end,
                // then they quit, so X
                var next_state = "";
                var next_state_arr = [];

                next_state_arr = example_seq.concat([action]);
                //if it is more than length STATE_LEN, cut it to last STATE_LEN
                if (next_state_arr.length > STATE_LEN) {
                    next_state_arr = next_state_arr.slice(-STATE_LEN)
                }


                //if we quit, next state is simply quit
                //else, is the new history + performance when we took action
                if(path_quit && pos === rand_traj_seq.length - 1 ){
                    next_state = "X";
                    value = 0;
                } else {
                    var n_perf = exports.encodeMistakes(parseInt(next_mistake));
                    if (mode === "static"){
                        n_perf = "N";
                    }
                    next_state = next_state_arr.join('-') + "/" +   n_perf;
                }

                var obj = {
                    'state': state,
                    'action': action,
                    'value': value,
                    'next_state': next_state
                };
                //console.log(obj);
                q_array_path.push(obj)
            }
        }
        pos = pos - 1;
    }
    return q_array_path;

}

//Function filterResponses: filter array based on some criteria
function filterResponses(array, criteria) {
    return array.filter(function (obj) {
        return Object.keys(criteria).every(function (c) {
            return obj[c] == criteria[c];
        });})
};