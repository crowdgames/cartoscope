var express = require('express');
var router = express.Router();
module.exports = router;
var filters = require('../constants/filters');
var Promise = require('bluebird');
var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');
var resultDB = require('../db/results');
var dynamicDB = require('../db/dynamic');
var querystring = require('querystring');
var path = require('path');
var randomString = require('randomstring');
var bcrypt = require('bcrypt');
var _ = require('underscore');

var salt = process.env.CARTO_SALT;
var max_consecutive = 20; //max number of consecutive subtasks, eg L7



// Generate n different genetic sequences of size sz randomly
//this does not require existing top4, only one sequence in order to get the genetic pool
router.get('/initRandomGeneticSequences/:mainCode/:n/:sz/',
    function(req, res, next) {
        var mainCode = req.params.mainCode;
        var code_pool = {};
        var final_sequences_list = []; //list of strings
        var seq_size = parseInt(req.params.sz); //size of sequence
        var seq_n  = parseInt(req.params.n); // number of sequences to generate
        var def_progress_type = 'none'; //default progress type

        //First have to get the gene pool from db
        dynamicDB.getGenePool(mainCode).then(function(gene_res) {


            var gene = gene_res[0];

            var code_pool = decodeGeneticPool(gene);

            //now we need to create n random sequences of size sz
            //do not allow duplicates
            while (final_sequences_list.length < seq_n) {
                var generated_seq = [];
                for (var j = 0; j < seq_size; j++) {
                    generated_seq.push(generateGenome(code_pool));
                }
                //add to list as string separated by -
                var encoded_seq = encodeSequence(generated_seq);
                var enc_string = encoded_seq.join("-");
                if (final_sequences_list.indexOf(enc_string) == -1){
                    final_sequences_list.push(enc_string)
                }
            }

            //add to DB
            //get basic info from gene
            var seq_gen_info = gene;
            seq_gen_info.progress_type = def_progress_type;
            seq_gen_info.active = 1;
            seq_gen_info.method = "random"

            dynamicDB.insertGeneticSequences(seq_gen_info,final_sequences_list).then(function(insert_data) {
                res.status(200).send("Sequences generated")

            }, function(error){
                console.log(error);
                res.status(500).send("Could not add generated sequences");
            })

        }, function (error){
            console.log(error);
            res.status(500).send("Could not find gene pool");

        });
    });

//
// //Update fitness functions using avg label count across workers
// //Make sure to run this first before generating new sequences
// router.get('/updateFitnessFunctionsAVG/:mainCode',
//     function(req, res, next) {
//
//         var main_code = req.params.mainCode;
//         //Get project from code
//         projectDB.getSingleProjectFromCode(main_code).then(function(project) {
//             //update fitness functions based on code:
//             dynamicDB.updateFitnessFunctionsAVG(project).then(function(data) {
//                 res.send(200).status("Fitness functions updated succesfully!")
//             },function (error){
//                 res.send(400).status("Could not update fitness functions for given code")
//             });
//         }, function (error) {
//             res.send(404).status("Error Updating Fitness Functions: Project not found")
//         });
//     });

//Update fitness functions using avg label count across workers
//Make sure to run this first before generating new sequences
// MEDIAN VALUES ENDPOIN
router.get('/updateFitnessFunctions/:mainCode',
    function(req, res, next) {

        var main_code = req.params.mainCode;


        //get all currently active genetic ids from stats
        dynamicDB.getGenePoolIdsActive(main_code).then(function(g_data) {
            //get all worker stats for these ids
            var gen_ids = g_data[0].genetic_id_list;
            //get the worker stats
            dynamicDB.getWorkerStats(gen_ids).then(function(data) {

                var fit_val_list = [];

                var gen_ids_list = gen_ids.split(",");
                //for every genetic id, sort based on label count and sort based on comp time
                gen_ids_list.forEach(function(gid){
                    //filter data
                    var gen_data = filterResponses(data,{genetic_id:parseInt(gid)});
                    if (gen_data.length != 0){
                        var med_time = 0;
                        var med_count = 0;
                        //sort and get median using underscore library
                        sorted_count =  _.sortBy(gen_data, 'label_count');
                        sorted_time =  _.sortBy(gen_data, 'comp_time');
                        //if even, median = avg(middle left, middle right)
                        var mid_point = gen_data.length/parseFloat(2);

                        if (gen_data.length % 2 == 0  ) {

                            var m_left = parseInt(mid_point) -1;
                            var m_right = parseInt(mid_point);
                            med_count = ( sorted_count[m_left].label_count + sorted_count[m_right].label_count )/parseFloat(2);
                            med_time = ( sorted_time[m_left].comp_time + sorted_time[m_right].comp_time )/parseFloat(2);
                        } else {
                            var m_p = parseInt(Math.floor(mid_point));
                            med_count = sorted_count[m_p].label_count;
                            med_time = sorted_time[m_p].comp_time;
                        }
                        //push to list
                        fit_val_list.push([gid,med_count,med_time]);
                    }

                });


                //Update specific functions:
                dynamicDB.updateSpecificFunctions(fit_val_list).then(function(dt) {

                    res.send(200).status("Fitness functions updated succesfully!")
                },function (error){
                    res.send(400).status("Could not update fitness functions for given code")
                });

            },function (error){
                res.send(400).status("Could not get worker stats for given code")
            });
        }, function (error) {
            res.send(404).status("Error Updating Fitness Functions: Project not found")
        });
    });


//Requires a fitness function
router.get('/updateTaskGeneticSequences/:mainCode/:strategy/:n/:fit',
    function(req, res, next) {

        var main_code = req.params.mainCode;
        var strategy = req.params.strategy;
        var in_strat = strategy;
        var fitness_type = req.params.fit;
        var rem_seq = req.params.n; //how many more to generate

        //if no correct fitness type,
        var topK = 4; //how many top to get
        var gen_list = [];
        var seed_list = [];
        var current_sequences = [];

        var available_strategies = ['flipblock','cross','crosspair','mixed'];
        if (available_strategies.indexOf(strategy) == -1){
            res.status(404).send("Strategy:" + strategy + " not supported");
        } else {
            //Get all sequences ordered and make the top K the seeds
            //need to fetch all existing to make sure we don't generate duplicates!
            dynamicDB.getAllSequencesSorted(main_code,fitness_type).then(function(total_list) {

                //get the pool data from the first item (all should have the same pool data
                var pool_data = decodeGeneticPool(total_list[0]);

                for (var i = 0; i < total_list.length; i++) {
                    if (i < topK){
                        seed_list.push(total_list[i]);
                    }

                    //populate current sequences to avoid making duplicates
                    current_sequences.push(total_list[i].seq);
                }


                //SET ALL OTHERS TO ACTIVE=0!
                //dynamicDB.deactivateBottomSequences(main_code,seed_list).then(function(dt) {
                dynamicDB.deactivateAllSequences(main_code).then(function(dt) {
                    //generate remaining ones
                    for (var i = 0; i < rem_seq; i++) {

                        if (strategy == "mixed"){
                            if (i < rem_seq/2) {
                                in_strat = "flipblock";
                            } else {
                                in_strat = "cross";
                            }
                        }

                        while (true){
                            //add a new sequence based on the strategy
                            var gen_seq = generate_from_strategy(seed_list,in_strat,pool_data);
                            //check if not already existing
                            if (current_sequences.indexOf(gen_seq.seq) == -1){
                                break;
                            } else {
                                console.log("Ignoring duplicate")
                            }

                        }
                        //add to gen list and also add the sequence so we don't get a duplicate
                        current_sequences.push(gen_seq.seq);
                        gen_list.push(gen_seq);
                    }

                    //add to pool and set as active
                    dynamicDB.insertGeneticSequences2(gen_list).then(function(insert_data) {
                        res.status(200).send("Sequences generated")

                    }, function(error){
                        console.log(error);
                        res.status(500).send("Could not add generated sequences");
                    })

                }, function (error){
                    res.status(500).send("Could not deactivate sequences");
                });


            }, function (error) {
                res.send(404).status("Error Updating Sequences: Project not found")
            });
        }




    });



//create a sequence of size 100 based on current tree state and MONTE CARLO
//testing endpoint. The functionality is used when creating an entry in mturk workers in the mturk path
router.get('/createUserSequenceFromTree/:mainCode', function(req,res,next){

    var main_code = req.params.mainCode;
    dynamicDB.createUserSequenceFromTree(main_code).then(function(generated_genetic_id) {
        res.status(200).send({genetic_id: generated_genetic_id})
    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })
});


// update the tree using the data provided (source: R code)
// testing endpoint. The functionality is used when creating an entry in mturk workers in the mturk path
router.post('/updateGeneticTreeFromRDATA/:mainCode', function(req,res,next){


    var main_code = req.params.mainCode;
    var updated_tree = req.body.tree

    dynamicDB.updateTreeFromDATA(updated_tree).then(function(data) {
        res.status(200).send("Tree updated from R data sucessfully")
    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })


});


//create a sequence of size 100 based on current tree state and MONTE CARLO
//testing endpoint. The functionality is used when creating an entry in mturk workers in the mturk path
router.get('/retrieveTree/:mainCode', function(req,res,next){

    var main_code = req.params.mainCode;
    dynamicDB.getTreeFromCode(main_code).then(function(tree) {
        res.send(tree)
    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })
});




//given a list of codes and a symbol, break them up and add to object
function setPoolMultipe(obj,lstring,smb){
    if (lstring != undefined){
        var project_list = lstring.split(',');
        project_list.forEach(function(item){
            obj[smb] = item;
            smb += smb;
        });
    }
    return obj
}

//given an item from the task_genetic_sequences table,extract the pool as an object
// e.g {L:..., LL:...}
function decodeGeneticPool(data){

    var pool_data = {};
    var short_codes = {'label': 'L','map': 'M','marker':'A'};
    for (var k in data){
        //if key in the form of _project e.g label_project, map_project, marker_project
        if ( k.indexOf('_project') !== -1) {
            var itm = data[k];

            if (itm != undefined){
                var type_p = k.split('_')[0];
                var code_list = itm.split(',');
                var s_code = short_codes[type_p];
                code_list.forEach(function(item){
                    pool_data[s_code] = item;
                    s_code += s_code;
                })
            }
        }
    }
    return (pool_data)
}



//generate a genome as random type of task (L,M,A,...)
// eg L, M etc
function generateGenome(pool){
    //pick random first part of genome
    var keys = Object.keys(pool);
    // var n = randomInt(1,max_consecutive);
    var smb = keys[Math.floor(Math.random()*keys.length)];
    // return (smb + n.toString())
    return smb
}

//return random integer [min,max]
function randomInt(min,max){
    return (Math.floor(Math.random() * (max - min + 1) ) + min);
}


//encode long form sequence to short form
function encodeSequence(seq_array){

    var enc_array = [];
    var symbol = seq_array[0];
    var n = 1;
    for (var i = 1; i < seq_array.length; i++) {

        if (seq_array[i] != symbol){
            enc_array.push(symbol + n.toString());
            symbol = seq_array[i];
            n = 1;
        } else {
            n++;
        }
    };
    //push remaining
    enc_array.push(symbol + n.toString());
    return(enc_array)
}

function decodeBlock(bl){
    //start from end of string
    //while substring can be parsed to int, then digit and remaining is string
    var end = bl.length;
    var end_indx = end;
    while(true){
        end_indx--;
        digit = bl.substring(end_indx,end); //start with last one
        symbol = bl.substring(0,end_indx);
        //if digit stops parsing, we hit a symbol
        if (isNaN(parseInt(digit)) ||  end_indx <= 0 ) {
            end_indx++;
            digit = bl.substring(end_indx,end); //start with last one
            symbol = bl.substring(0,end_indx);
            break;
        }
    }
    return {digit:parseInt(digit),symbol:symbol}
}


//go from short form to long form: from L4-M1 to LLLLM
function decodeSequence(sq){
    var dec_seq = [];
    //split into segments
    var seg_list = sq.split('-');
    //for each segment, push the symbol:
    seg_list.forEach((function (segment){

        var dbs = decodeBlock(segment)
        var number = dbs.digit;
        var symbol = dbs.symbol;
        for (var i=0; i < number;i++){
            dec_seq.push(symbol)
        }
    }));
    return dec_seq;
}


function generate_from_strategy(sl,strategy,pool_data){

    if (strategy == "flipblock") {

        //pick one random and run flipblock function
        var rand_index = randomInt(0, sl.length - 1);
        //MUST DEEEP COPY OBJECT FIRST
        var rand_seq = JSON.parse(JSON.stringify(sl[rand_index]));
        var gen_seq = generate_flipblock(rand_seq,pool_data);
        var gen_from = rand_seq.id;


    } else if (strategy == "cross") {
        var rand_index1 = randomInt(0, sl.length - 1);
        var rand_seq1 = JSON.parse(JSON.stringify(sl[rand_index1]));
        var rand_index2 = randomInt(0, sl.length - 1);
        var rand_seq2 = JSON.parse(JSON.stringify(sl[rand_index2]));
        var gen_seq = generate_cross(rand_seq1,rand_seq2);
        var gen_from = rand_seq1.id + '-' + rand_seq2.id;

    } else if (strategy == "crosspair") {
        var rand_index1 = randomInt(0, sl.length - 1);
        var rand_seq1 = JSON.parse(JSON.stringify(sl[rand_index1]));
        var rand_index2 = randomInt(0, sl.length - 1);
        var rand_seq2 = JSON.parse(JSON.stringify(sl[rand_index2]));
        var gen_seq = generate_crosspair(rand_seq1,rand_seq2);
        var gen_from = rand_seq1.id + '-' + rand_seq2.id;

    } else {
        //generate a random one
        console.log("TODO: Other strategies");
        var gen_seq = {};
    }

    //add method of generation to object to be written
    gen_seq.method = strategy;
    gen_seq.generated_from = gen_from;
    return (gen_seq);
}

// pick random block size from 2 to 4 and flip everything in there:
// flip based on individual genome, by flipping coin
function generate_flipblock(rs,pl){

    //pick random block size from 2-4
    var block_size = randomInt(2,4);
    var new_seq = decodeSequence(rs.seq);

    //pick random block position
    var random_pos = randomInt(0,new_seq.length-block_size-1);
    //flip the block
    for (var i=random_pos; i < random_pos + block_size; i++ ){
        new_seq[i] = flipGenome(new_seq[i],pl)
    }
    //encode sequence to short form and return object
    rs.seq = encodeSequence(new_seq).join('-');

    return(rs);
}
//crosspair: pick random middle point j, keep all up to j from first
//and add remaining from second
//Assumes both sequences same size and using same pool
function generate_cross(seq1,seq2) {

    //make new sequence starting from first sequence
    var new_seq = decodeSequence(seq1.seq);
    var sec_seq = decodeSequence(seq2.seq);
    //pick random point to
    var random_pos = randomInt(0,new_seq.length-1);
    for (var i = 0; i < new_seq.length - random_pos; i++) {
        new_seq[random_pos+i] = sec_seq[i]
    };

    //encode resulting sequence and return
    seq1.seq = encodeSequence(new_seq).join('-');
    return(seq1);
}


//crosspair: go in blocks of size 2 and flip coin
//if heads: do s1a-s2b else do s2a-s1b
//assumes same size of sequences and same genome pool
function generate_crosspair(seq1,seq2) {

    //make new sequence starting from first sequence
    var first_seq = decodeSequence(seq1.seq);
    var sec_seq = decodeSequence(seq2.seq);
    var new_seq = [];

    for (var i=0; i< first_seq.length; i+=2){
        coin = randomInt(0,1);
        if (coin){
            new_seq[i] = first_seq[i];
            new_seq[i+1] = sec_seq[i+1];
        } else {
            new_seq[i] = sec_seq[i];
            new_seq[i+1] = first_seq[i+1];
        }
    }

    //encode resulting sequence and return with metadata of first sequence
    seq1.seq = encodeSequence(new_seq).join('-');
    return(seq1);
}


//flip genome to another by picking from the supplied genome pool.
function flipGenome(genome,pl){

    var pool_options = Object.keys(pl); //get all the pool options
    //remove current genome from options
    pool_options.splice(pool_options.indexOf(genome), 1);
    //pick random item from pool
    var rand_pos = randomInt(0, pool_options.length - 1);
    new_genome = pool_options[rand_pos];
    return(new_genome);

}

//return unique values from array of objects based on key
function get_unique(data,key){
    var unique = {};
    var distinct = [];
    data.forEach(function (item) {
        if (!unique[item[key]]) {
            distinct.push(item[key]);
            unique[item[key]] = true;
        }
    });
    return(unique)
}

//Function filterResponses: filter array based on some criteria
function filterResponses(array, criteria) {
    return array.filter(function (obj) {
        return Object.keys(criteria).every(function (c) {
            return obj[c] == criteria[c];
        });})
};