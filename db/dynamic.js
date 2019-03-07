var db = require('../db/db');
var Promise = require('bluebird');
var databaseName = process.env.CARTO_DB_NAME;


//get the gene pool
exports.getGenePool = function(projectId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        console.log(projectId);
        connection.queryAsync('SELECT * from task_genetic_sequences where unique_code_main=? and method!="tree" and active=0 LIMIT 1', [projectId])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//returns the pool as an object {L:... , LL: ..., M:...}
//ignore deactivated sequences that have active = -1
exports.getGenePoolCoded = function(projectId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT id,label_project,map_project,marker_project from task_genetic_sequences where active !=-1 and method!="tree" and unique_code_main=? LIMIT 1', [projectId])
            .then(
                function(data) {

                    //convert to object with keys and mappings
                    var pool_data = decodeGeneticPool(data[0]);
                    resolve(pool_data);
                }, function(err) {
                    error(err);
                });
    });
};


//get the gene pool
exports.getGenePoolIds = function(projectCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        console.log(projectCode);
        connection.queryAsync('SELECT GROUP_CONCAT(id) as genetic_id_list from task_genetic_sequences where active!=-1 and method!="tree" and unique_code_main=?  ', [projectCode])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get the gene pool only for active ones
exports.getGenePoolIdsActive = function(projectCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        console.log(projectCode);
        connection.queryAsync('SELECT GROUP_CONCAT(id) as genetic_id_list from task_genetic_sequences where active=1 and method!="tree" and unique_code_main=?  ', [projectCode])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//insert a genetic sequence
exports.insertGeneticSequences = function(gen_info,sequence_list) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        //prepare data to insert as
        var values = [];
        sequence_list.forEach(function(item){
            values.push([
                gen_info.unique_code_main,
                item,
                gen_info.label_project,
                gen_info.map_project,
                gen_info.marker_project,
                gen_info.progress_type,
                gen_info.active,
                gen_info.method,
                gen_info.ignore_codes
            ])

        });
        connection.queryAsync('INSERT INTO task_genetic_sequences (unique_code_main,seq,label_project,map_project,marker_project,progress_type,active,method,ignore_codes) VALUES ?', [values])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//insert genetic sequences with independent genetic info objects
exports.insertGeneticSequences2 = function(sequence_list_obj) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        //prepare data to insert as
        var values = [];
        sequence_list_obj.forEach(function(item){
            values.push([
                item.unique_code_main,
                item.seq,
                item.label_project,
                item.map_project,
                item.marker_project,
                item.progress_type,
                1,
                item.method,
                item.generated_from,
                item.ignore_codes
            ])
        });
        connection.queryAsync('INSERT INTO task_genetic_sequences (unique_code_main,seq,label_project,map_project,marker_project,progress_type,active,method,generated_from,ignore_codes) VALUES ?', [values])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//insert genetic sequences with independent genetic info objects
exports.insertGeneticSequences2Tileoscope = function(sequence_list_obj) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        //prepare data to insert as
        var values = [];
        sequence_list_obj.forEach(function(item){
            values.push([
                item.unique_code_main,
                item.seq,
                item.pool,
                item.misc,
                1,
                item.method,
                item.generated_from,
                item.ignore_codes
            ])
        });
        connection.queryAsync('INSERT INTO tileoscope_task_genetic_sequences (unique_code_main,seq,pool,misc,active,method,generated_from,ignore_codes) VALUES ?', [values])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//select top K sequences from current main project
exports.selectTopKsequences = function(main_code,k) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from task_genetic_sequences where unique_code_main=? and active=1 and method!="tree" ' +
            'ORDER BY fitness_function DESC LIMIT ?',
            [main_code,k])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//select top K sequences from current main project, by fitness type
exports.getAllSequencesSorted = function(main_code,fitness_type) {

    var tp = "fitness_function";
    if (fitness_type == "2") {
        tp = "fitness_function2"
    }

    return new Promise(function(resolve, error) {
        var connection = db.get();
        var query = 'SELECT * from task_genetic_sequences where active != -1 and method!="tree" and unique_code_main=\"' + main_code +'\" ORDER BY ' + tp + ' DESC';
        connection.queryAsync(query)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//deactivate all sequences of the main code that do not have an id in the list
//leave permanently deactivated as is
exports.deactivateBottomSequences = function(main_code,excluded_items) {

    return new Promise(function(resolve, error) {
        var connection = db.get();

        var id_list = [];
        excluded_items.forEach(function(item){
            id_list.push(item.id.toString())
        });

        connection.queryAsync('update task_genetic_sequences set active=0 where active !=-1 and method!="tree" and unique_code_main=? and id NOT IN ('+
            id_list.toString() +')',
            [main_code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};
//deactivate all sequences of the main code
exports.deactivateAllSequences = function(main_code) {

    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('update task_genetic_sequences set active=0 where active != -1 and method!="tree" and unique_code_main=?',
            [main_code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//update fitness function based on votes
//fitness function used: avg image count across all users in the condition
//NO restirction on HITID
exports.updateFitnessFunction = function(project) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update task_genetic_sequences as tt \
        inner join \
        (select mg.genetic_id, mg.seq, mg.unique_code_main, mg.active, avg(mg.label_count) as avg_label_count \
        from \
        (select sr.user_id, sr.label_count,m.genetic_id,t.seq,t.unique_code_main,t.active \
        from \
        (select r.user_id, count(r.response) as label_count \
        from response as r \
        where project_id=? \
        group by r.user_id) as sr \
        left join mturk_workers as m \
        on m.workerID=sr.user_id \
        left join task_genetic_sequences as t \
        on t.id=m.genetic_id \
        where m.genetic_id IS NOT NULL and m.genetic_id !=0) as mg \
        group by mg.genetic_id) as ss \
        on tt.id=ss.genetic_id \
        set tt.fitness_function=ss.avg_label_count',
            [project.id])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//update all fitness functions:
//Fitness1: Label Count
//Fitness2: Completion Time
//AVG STATS
exports.updateFitnessFunctionsAVG = function(project) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update task_genetic_sequences as tt \
        inner join \
        (select mg.genetic_id, mg.seq, mg.unique_code_main, mg.active,avg(mg.label_count) as avg_label_count, avg(mg.comp_time) as avg_comp_time \
        from \
        (select sr.user_id,sr.label_count, sr.comp_time,m.genetic_id,t.seq,t.unique_code_main,t.active \
        from \
        (select r.user_id, TIMESTAMPDIFF(SECOND,min(timestamp),max(timestamp)) as comp_time, count(r.response) as label_count \
        from response as r \
        where project_id=? \
        group by r.user_id) as sr \
        left join mturk_workers as m \
        on m.workerID=sr.user_id \
        left join task_genetic_sequences as t \
        on t.id=m.genetic_id \
        where m.genetic_id IS NOT NULL and m.genetic_id !=0) as mg \
        group by mg.genetic_id) as ss \
        on tt.id=ss.genetic_id \
        set tt.fitness_function2=ss.avg_comp_time , tt.fitness_function=ss.avg_label_count',
            [project.id])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


exports.getWorkerStats = function(gen_id_list) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        var query = '(select sr.user_id,sr.label_count, sr.comp_time, sr.comp_time/sr.label_count as time_per_image,m.genetic_id,t.seq,t.unique_code_main,t.active \
        from \
        (select r.user_id, TIMESTAMPDIFF(SECOND,min(r.timestamp),max(r.timestamp)) as comp_time, count(r.response) -SUM(if(r.response = -1, 1, 0)) as label_count \
        from response as r \
        group by r.user_id) as sr \
        left join mturk_workers as m \
        on m.workerID=sr.user_id \
        left join task_genetic_sequences as t \
        on t.id=m.genetic_id \
        where m.genetic_id IN ('+ gen_id_list +  ') ) ';

        connection.queryAsync(query)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    console.log(err);
                    error(err);
                });
    });
};


exports.updateSpecificFunctions = function(function_data) {

    //join array of arrays into
    let fit_vals ="";
    function_data.forEach(function(item){
        fit_vals += "(" + item.join() +"),"
    });
    //remove last comma from fit_vals
    fit_vals = fit_vals.slice(0, -1);

    return new Promise(function(resolve, error) {
        var connection = db.get();
        query = 'INSERT INTO task_genetic_sequences (id,fitness_function,fitness_function2) VALUES '+ fit_vals +' \
            ON DUPLICATE KEY UPDATE fitness_function=VALUES(fitness_function),fitness_function2=VALUES(fitness_function2)'
        connection.queryAsync(query)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};



//get the active genetic tree for the given main code
exports.getTreeFromCode = function(projectCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from genetic_tree where active=1 and unique_code_main=?  ', [projectCode])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get the active genetic tree for the given main code
exports.getTreeFromCodeTileoscope = function(projectCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_genetic_tree where active=1 and unique_code_main=?  ', [projectCode])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//based on tree with pool, generate sequence
exports.createUserSequenceFromTreeRandom = function(main_code){


    return new Promise(function(resolve, error) {
        //will generate a sequence with max horizon 100. should update if not realistic
        var sequence_length = 100;

        //get tree from main code
        exports.getTreeFromCode(main_code).then(function(tree) {


            //start with root:
            var parent = "start";
            var generated_sequence = [];
            var parent_info = filterResponses(tree,{node:parent});
            var root_info = parent_info[0];
            var possible_children_pool = decodeGeneticPool(root_info); //get all possible children from root



            //repeat for size k, pick random option
            for (var i = 0; i < sequence_length; i++) {

                var next_step = generateGenome(possible_children_pool); //essentially picks a child at random

                //at this point we have the next step: push it to the total sequence:
                generated_sequence.push(next_step);
                //update the parent to be the sequence so far:
            }

            //after the sequence is complete, convert to short form and return it
            var gen_seq_short = encodeSequence(generated_sequence).join("-");
            //create the object of the sequence and add it to the task_genetic_sequences:

            var gen_obj = {
                unique_code_main: root_info.unique_code_main,
                seq: gen_seq_short,
                label_project: root_info.label_project,
                map_project: root_info.map_project,
                marker_project: root_info.marker_project,
                ignore_codes: root_info.ignore_codes,
                progress_type: root_info.progress_type || "none",
                active: 1,
                method: "tree_random"
            };
            var gen_list = [gen_obj];
            exports.insertGeneticSequences2(gen_list).then(function(insert_data) {
                //Send genetic id back
                if (insert_data.insertId) {
                    resolve(insert_data.insertId);
                } else if (insert_data.affectedRows > 0) {
                    resolve(0);
                } else {
                    error({code: 'Problem with insertion'});
                }


            }, function(err){
                console.log(err);
                error(err)
            })


        }, function(err){
            console.log(err);
            error(err)
        })

    });


};

exports.createUserSequenceQlearn = function(main_code) {

    return new Promise(function (resolve, error) {
        //Randomly pick between making a random sequence and picking the optimal strategy qlearn
        var pick_optimal = Math.round(Math.random());

        if (pick_optimal){
            console.log("Picking optimal");

            exports.pickQlearnOptimalSequence(main_code).then(function(genetic_id) {
                resolve(genetic_id)
            })
        } else {
            console.log("Creating random");
            exports.createUserSequenceFromTreeRandom(main_code).then(function(genetic_id) {
                resolve(genetic_id)
            })
        }
    });

};


//pick q optimal sequence
exports.pickQlearnOptimalSequence = function(main_code) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT id from task_genetic_sequences where unique_code_main=? and active=1 and method="qlearn_optimal" ',
            [main_code])
            .then(
                function(data) {
                    resolve(data[0].id);
                }, function(err) {
                    error(err);
                });
    });
};


//pick optimal for Tileoscope
exports.pickQlearnOptimalSequenceTileoscope = function(main_code) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT id as genetic_id,seq from tileoscope_task_genetic_sequences where unique_code_main=? and active=1 and method="qlearn_optimal" ',
            [main_code])
            .then(
                function(data) {
                    resolve(data[0]);
                }, function(err) {
                    error(err);
                });
    });
};



exports.createUserSequenceQlearnTileoscope = function(main_code) {

    return new Promise(function (resolve, error) {
        //Randomly pick between making a random sequence and picking the optimal strategy qlearn
        var pick_optimal = Math.round(Math.random());

        if (pick_optimal){
            console.log("Picking optimal");

            exports.pickQlearnOptimalSequenceTileoscope(main_code).then(function(genetic_id) {
                resolve(genetic_id);
            })
        } else {
            console.log("Creating random");
            exports.createUserSequenceFromTreeTileoscopeRandom(main_code).then(function(genetic_id) {
                resolve(genetic_id)
            })
        }
    });

};


//pick an already generated sequence from the db
exports.pickGeneticSequenceTileoscope = function(main_code) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT id as genetic_id,seq from tileoscope_task_genetic_sequences where unique_code_main=? and active=1 ORDER BY RAND() LIMIT 1 ',
            [main_code])
            .then(
                function(data) {
                    resolve(data[0]);
                }, function(err) {
                    error(err);
                });
    });
};


//create a sequence of size 100 based on current tree state and MONTE CARLO
exports.createUserSequenceFromTree = function(main_code){


    return new Promise(function(resolve, error) {
        //will generate a sequence with max horizon 100. should update if not realistic
        var sequence_length = 100;

        //get tree from main code
        exports.getTreeFromCode(main_code).then(function(tree) {


            //start with root:
            var parent = "start";
            var generated_sequence = [];

            //repeat for size k
            for (var i = 0; i < sequence_length; i++) {

                //get parent info: Should only be one entry (one node)
                var parent_info = filterResponses(tree,{node:parent});


                if (i==0){
                    var root_info = parent_info[0];

                    var possible_children_pool = decodeGeneticPool(root_info); //get all possible children from root


                }

                //IF NO PARENT INFO, set unexpanded children to all possible combos
                //follow up check will always go to randomly pick unexpanded child
                if (parent_info.length != 0){


                    //var parent_id = parent_info[0].id;
                    //get possible children:  e.g L,LL, M etc. It should be a combination of the "_project" fields

                    //get expanded children entries of the parent:
                    var expanded_children = filterResponses(tree,{parent:parent});

                    //get unexpanded children
                    var unexpanded_children = get_unexpanded_tree_children(possible_children_pool,expanded_children);
                    possible_children_pool = decodeGeneticPool(root_info); //get all possible children from root (need to redo this because object messed up in function

                } else {
                    var unexpanded_children = possible_children_pool;
                    possible_children_pool = decodeGeneticPool(root_info); //get all possible children from root



                }

                //TODO: P( pick_unexpanded) = #unexpanded / #all_children
                // P( pick_expanded) = 1 - P( pick_unexpanded)
                // First draw: whether to pick from expanded or unexpanded pool
                // if 0: pick uniformly random from unexpanded
                // if 1: pick using UCT from expanded



                var pick_unexp_p = Object.keys(unexpanded_children).length*1.0/Object.keys(possible_children_pool).length; //make sure float division!
                var pick_exp_p = 1 - pick_unexp_p;
                var pick_choice = pick_random_with_likelihood([0,1],[pick_unexp_p,pick_exp_p]);

                //0: pick unexpanded, 1: pick expanded
                if (pick_choice == 0){
                    var next_step = generateGenome(unexpanded_children); //essentially picks a child at random

                } else {
                    var next_step = select_UCT(expanded_children);

                }


                //at this point we have the next step: push it to the total sequence:
                generated_sequence.push(next_step);
                //update the parent to be the sequence so far:
                parent = generated_sequence.join('-');

            }

            //after the sequence is complete, convert to short form and return it
            var gen_seq_short = encodeSequence(generated_sequence).join("-");
            //create the object of the sequence and add it to the task_genetic_sequences:

            var gen_obj = {
                unique_code_main: root_info.unique_code_main,
                seq: gen_seq_short,
                label_project: root_info.label_project,
                map_project: root_info.map_project,
                marker_project: root_info.marker_project,
                ignore_codes: root_info.ignore_codes,
                progress_type: root_info.progress_type || "none",
                active: 1,
                method: "tree"
            };
            var gen_list = [gen_obj];
            exports.insertGeneticSequences2(gen_list).then(function(insert_data) {
                //Send genetic id back
                if (insert_data.insertId) {
                    resolve(insert_data.insertId);
                } else if (insert_data.affectedRows > 0) {
                    resolve(0);
                } else {
                    error({code: 'Problem with insertion'});
                }


            }, function(err){
                console.log(err);
                error(err)
            })


        }, function(err){
            console.log(err);
            error(err)
        })

    });


};




exports.createUserSequenceFromTreeTileoscope = function(main_code){


    return new Promise(function(resolve, error) {
        //will generate a sequence with max horizon 100. should update if not realistic
        var sequence_length = 10;

        //get tree from main code
        exports.getTreeFromCodeTileoscope(main_code).then(function(tree) {


            //start with root:
            var parent = "start";
            var generated_sequence = [];

            //repeat for size k
            for (var i = 0; i < sequence_length; i++) {

                //get parent info: Should only be one entry (one node)
                var parent_info = filterResponses(tree,{node:parent});


                if (i==0){
                    var root_info = parent_info[0];

                    var possible_children_pool = decodeGeneticPoolTileoscope(root_info); //get all possible children from root


                }

                //IF NO PARENT INFO, set unexpanded children to all possible combos
                //follow up check will always go to randomly pick unexpanded child
                if (parent_info.length != 0){


                    //var parent_id = parent_info[0].id;
                    //get possible children:  e.g L,LL, M etc. It should be a combination of the "_project" fields

                    //get expanded children entries of the parent:
                    var expanded_children = filterResponses(tree,{parent:parent});

                    //get unexpanded children
                    var unexpanded_children = get_unexpanded_tree_children(possible_children_pool,expanded_children);
                    possible_children_pool = decodeGeneticPoolTileoscope(root_info); //get all possible children from root (need to redo this because object messed up in function

                } else {
                    var unexpanded_children = possible_children_pool;
                    possible_children_pool = decodeGeneticPoolTileoscope(root_info); //get all possible children from root



                }

                //TODO: P( pick_unexpanded) = #unexpanded / #all_children
                // P( pick_expanded) = 1 - P( pick_unexpanded)
                // First draw: whether to pick from expanded or unexpanded pool
                // if 0: pick uniformly random from unexpanded
                // if 1: pick using UCT from expanded



                var pick_unexp_p = Object.keys(unexpanded_children).length*1.0/Object.keys(possible_children_pool).length; //make sure float division!
                var pick_exp_p = 1 - pick_unexp_p;
                var pick_choice = pick_random_with_likelihood([0,1],[pick_unexp_p,pick_exp_p]);

                //0: pick unexpanded, 1: pick expanded
                if (pick_choice == 0){
                    var next_step = generateGenome(unexpanded_children); //essentially picks a child at random

                } else {
                    var next_step = select_UCT(expanded_children);

                }


                //at this point we have the next step: push it to the total sequence:
                generated_sequence.push(next_step);
                //update the parent to be the sequence so far:
                parent = generated_sequence.join('-');

            }

            //after the sequence is complete, convert to short form and return it
            var gen_seq_short = generated_sequence.join("-");
            //create the object of the sequence and add it to the task_genetic_sequences:

            var gen_obj = {
                unique_code_main: root_info.unique_code_main,
                seq: gen_seq_short,
                pool: root_info.pool,
                ignore_codes: root_info.ignore_codes,
                misc: root_info.misc || "none",
                active: 1,
                method: "tree"
            };
            var gen_list = [gen_obj];
            exports.insertGeneticSequences2Tileoscope(gen_list).then(function(insert_data) {
                //Send genetic id back
                if (insert_data.insertId) {
                    resolve({genetic_id:insert_data.insertId,seq:gen_seq_short});
                } else if (insert_data.affectedRows > 0) {
                    resolve(0);
                } else {
                    error({code: 'Problem with insertion'});
                }


            }, function(err){
                console.log(err);
                error(err)
            })


        }, function(err){
            console.log(err);
            error(err)
        })

    });


};

exports.createUserSequenceFromTreeTileoscopeRandom = function(main_code){


    return new Promise(function(resolve, error) {
        //will generate a sequence with max horizon 100. should update if not realistic
        var sequence_length = 10;

        //get tree from main code
        exports.getTreeFromCodeTileoscope(main_code).then(function(tree) {


            //start with root:
            var parent = "start";
            var generated_sequence = [];
            var parent_info = filterResponses(tree,{node:parent});
            var root_info = parent_info[0];
            var possible_children_pool = decodeGeneticPoolTileoscope(root_info); //get all possible children from root



            //repeat for size k, pick random option
            for (var i = 0; i < sequence_length; i++) {

                var next_step = generateGenome(possible_children_pool); //essentially picks a child at random

                //at this point we have the next step: push it to the total sequence:
                generated_sequence.push(next_step);
                //update the parent to be the sequence so far:
            }

            //after the sequence is complete, convert to short form and return it
            var gen_seq_short = encodeSequence(generated_sequence).join("-");
            //create the object of the sequence and add it to the task_genetic_sequences:

            //after the sequence is complete, convert to short form and return it
            var gen_seq_short = generated_sequence.join("-");
            //create the object of the sequence and add it to the task_genetic_sequences:

            var gen_obj = {
                unique_code_main: root_info.unique_code_main,
                seq: gen_seq_short,
                pool: root_info.pool,
                ignore_codes: root_info.ignore_codes,
                misc: root_info.misc || "none",
                active: 1,
                method: "tree_random"
            };
            var gen_list = [gen_obj];
            exports.insertGeneticSequences2Tileoscope(gen_list).then(function(insert_data) {
                //Send genetic id back
                if (insert_data.insertId) {
                    resolve({genetic_id:insert_data.insertId,seq:gen_seq_short});
                } else if (insert_data.affectedRows > 0) {
                    resolve(0);
                } else {
                    error({code: 'Problem with insertion'});
                }


            }, function(err){
                console.log(err);
                error(err)
            })


        }, function(err){
            console.log(err);
            error(err)
        })

    });


};




//create a sequence of size 100 based on current tree state and MONTE CARLO, but with first K levels forced
exports.createUserSequenceFromTreeForcedK = function(main_code,depth){


    return new Promise(function(resolve, error) {
        //will generate a sequence with max horizon 100. should update if not realistic
        var sequence_length = 100;
        var uct_c = Math.sqrt(2); //constant for Monte Carlo UCT

        //get tree from main code
        exports.getTreeFromCode(main_code).then(function(tree) {


            //start with root:
            var parent = "start";
            var generated_sequence = [];


            //get root here:
            //get parent info: Should only be one entry (one node)
            var root_info = filterResponses(tree,{node:parent})[0];
            var unexpanded_children = decodeGeneticPool(root_info);


            //Pick one of the forced levels that haven't been satisfied yet and add to generated sequence;
            //get assigned subsequence and update it as assigned
            exports.getUnassignedOption(main_code,depth).then(function(subseq_data){

                //Check if empty, if yes, then restart from depth=0
                if (subseq_data.length > 0){
                    var subseq = subseq_data[0].subsequence;
                    //set the first k based on the subset
                    var sub_list = subseq.split("-");
                    generated_sequence.push.apply(generated_sequence, sub_list);
                    //skip to current parent
                    parent = generated_sequence.join('-');

                } else {
                    var subseq = "";
                    depth = 0 ;
                }

                exports.updateForcedAssignment(main_code,subseq,depth).then(function(dd){



                    //continue as before
                    //repeat for size k
                    for (var i = depth; i < sequence_length; i++) {

                        //get parent info: Should only be one entry (one node)
                        var parent_info = filterResponses(tree,{node:parent});




                        //IF NO PARENT INFO, set unexpanded children to all possible combos
                        //follow up check will always go to randomly pick unexpanded child
                        if (parent_info.length != 0){
                            //var parent_id = parent_info[0].id;
                            //get possible children:  e.g L,LL, M etc. It should be a combination of the "_project" fields
                            var possible_children_pool = decodeGeneticPool(parent_info[0]);


                            //get expanded children entries of the parent:
                            var expanded_children = filterResponses(tree,{parent:parent});
                            //get unexpanded children
                            unexpanded_children = get_unexpanded_tree_children(possible_children_pool,expanded_children);
                        } else {
                            unexpanded_children = decodeGeneticPool(root_info);

                        }

                        //If unexpanded children exist, pick one randomly
                        if (Object.keys(unexpanded_children).length > 0){
                            var next_step = generateGenome(unexpanded_children); //essentially picks a child at random

                        } else {
                            //all options expanded, need to to UCT:
                            var N = 0; //total people across all branches
                            var uct_values = [];
                            //go through each and build the UCT
                            expanded_children.forEach(function(item){

                                // get the sequence code from the name
                                var name = item.node;
                                var codes = name.split('-');
                                var code = codes[codes.length -1];

                                //augment total people
                                N += item.people;
                                var obj = {
                                    code: code,
                                    fitness:item.fitness_function,
                                    n: item.people };
                                //add it to list
                                uct_values.push(obj)
                            });
                            //once we have that data, find max code:
                            var next_step = "";
                            var max_value = 0;
                            uct_values.forEach(function(item){

                                var child_value = item.fitness + uct_c * Math.sqrt( Math.log(N)/item.n);
                                // console.log("Child: " + item.code + " value: " + child_value.toString())
                                if (child_value >= max_value){
                                    max_value = child_value;
                                    next_step = item.code;
                                }
                            })
                        }
                        //at this point we have the next step: push it to the total sequence:

                        generated_sequence.push(next_step);
                        //update the parent to be the sequence so far:
                        parent = generated_sequence.join('-');

                    }

                    //after the sequence is complete, convert to short form and return it
                    var gen_seq_short = encodeSequence(generated_sequence).join("-");
                    //create the object of the sequence and add it to the task_genetic_sequences:

                    var gen_obj = {
                        unique_code_main: root_info.unique_code_main,
                        seq: gen_seq_short,
                        label_project: root_info.label_project,
                        map_project: root_info.map_project,
                        marker_project: root_info.marker_project,
                        ignore_codes: root_info.ignore_codes,
                        progress_type: root_info.progress_type || "none",
                        active: 1,
                        method: "tree"
                    };
                    var gen_list = [gen_obj];
                    exports.insertGeneticSequences2(gen_list).then(function(insert_data) {
                        //Send genetic id back
                        if (insert_data.insertId) {
                            resolve(insert_data.insertId);
                        } else if (insert_data.affectedRows > 0) {
                            resolve(0);
                        } else {
                            error({code: 'Problem with insertion'});
                        }


                    }, function(err){
                        console.log(err);
                        error(err)
                    })


                })
            })


        }, function(err){
            console.log(err);
            error(err)
        })

    });


};

//input: array of objects containing the tree nodes and info
//insert new nodes and on duplicate, update fitness functions and people values
exports.updateTreeFromDATA = function(tree_data) {

    //join array of arrays into
    let fit_vals ="";
    let key_vals = "";
    tree_data.forEach(function(item){
        if (item.node == "start"){
            console.log(item)
        }
        fit_vals += "(";
        key_vals = Object.keys(item).join(); // make sure the keys are set
        let ob_vals = Object.values(item);
        ob_vals.forEach(function(val){

            fit_vals += "'" + val + "',"
        });
        fit_vals = fit_vals.slice(0, -1);
        fit_vals += "),"
    });
    //remove last comma from fit_vals
    fit_vals = fit_vals.slice(0, -1);

    return new Promise(function(resolve, error) {
        var connection = db.get();
        query = 'INSERT INTO genetic_tree (' + key_vals + ') VALUES '+ fit_vals +' \
            ON DUPLICATE KEY UPDATE fitness_function=VALUES(fitness_function),fitness_function_mean=VALUES(fitness_function_mean)\
            ,people=VALUES(people)'
        connection.queryAsync(query)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//update tileoscope tree similar to cartoscope
exports.updateTreeFromDATATileoscope = function(tree_data) {

    //join array of arrays into
    let fit_vals ="";
    let key_vals = "";
    tree_data.forEach(function(item){
        if (item.node == "start"){
            console.log(item)
        }
        fit_vals += "(";
        key_vals = Object.keys(item).join(); // make sure the keys are set
        let ob_vals = Object.values(item);
        ob_vals.forEach(function(val){

            fit_vals += "'" + val + "',"
        });
        fit_vals = fit_vals.slice(0, -1);
        fit_vals += "),"
    });
    //remove last comma from fit_vals
    fit_vals = fit_vals.slice(0, -1);

    return new Promise(function(resolve, error) {
        var connection = db.get();
        query = 'INSERT INTO tileoscope_genetic_tree (' + key_vals + ') VALUES '+ fit_vals +' \
            ON DUPLICATE KEY UPDATE fitness_function=VALUES(fitness_function),fitness_function_mean=VALUES(fitness_function_mean)\
            ,people=VALUES(people)'
        connection.queryAsync(query)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};



//given the list of possible codes, make all possible combinations up to given depth
//e.g [L,LL,A,M]...
exports.populateForcedOptions = function(unique_code_main,options_list,depth) {

    return new Promise(function(resolve, error) {

        var key_vals = ["unique_code_main","subsequence","sub_size"];


        //generate all possible combinations of length d
        var fit_vals = "";
        var combs = getCombinationsSize(options_list,depth);
        combs.forEach(function(item){
            fit_vals += "(\"" + unique_code_main + "\",\"" + item + "\", "+ depth + "),"
        });
        //remove last comma from fit_vals
        fit_vals = fit_vals.slice(0, -1);



        //add to table
        var connection = db.get();
        query = 'INSERT INTO tree_forced (' + key_vals.toString() + ') VALUES '+ fit_vals +' \
            ON DUPLICATE KEY UPDATE active=1,assigned=0,satisfied=0;';
        connection.queryAsync(query)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//pick random unassigned forced option
exports.getUnassignedOption = function(projectCode,depth) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT subsequence from tree_forced where active=1 and assigned=0 and satisfied=0  and unique_code_main=? and sub_size=? ORDER BY RAND() LIMIT 1', [projectCode,depth])
            .then(
                function(subseq) {
                    resolve(subseq);
                }, function(err) {
                    error(err);
                });
    });
};

//update previously unassigned forced option as assigned
exports.updateForcedAssignment = function(projectCode,subsequence,depth) {
    return new Promise(function(resolve, error) {

        //if depth 0 don't do anything
        if (depth == 0){
            resolve([])
        } else {
            var connection = db.get();
            connection.queryAsync('update tree_forced set assigned=1 where active=1 and unique_code_main=? and subsequence=? and sub_size=?', [projectCode,subsequence,depth])
                .then(
                    function(data) {
                        resolve(data);
                    }, function(err) {
                        error(err);
                    });
        }


    });
};


//update previously unassigned forced option as satisfied
exports.updateForcedAssignmentSatisfied = function(projectCode,subsequence,depth) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update tree_forced set satisfied=1 where active=1 and assigned=1 and unique_code_main=? and subsequence=? and sub_size=?', [projectCode,subsequence,depth])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//update previously unassigned forced option as unassigned
exports.updateForcedAssignmentFree = function(projectCode,subsequence,depth) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update tree_forced set assigned=0 where active=1 and assigned=1 and unique_code_main=? and subsequence=? and sub_size=?', [projectCode,subsequence,depth])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


// ********************** FUNCTIONS **********************

// *******************************************************

// get unexpanded children from oroginal pool by eliminating expanded
function get_unexpanded_tree_children(pool,exp){
    //start with all unexpanded
    var unexpanded = pool;
    exp.forEach(function(item){
        //get the code from the squence : eg. L. LL etc. node should be in form L-M-LL etc
        var node = item.node;
        var codes = node.split('-');
        var code = codes[codes.length-1];
        //remove it from the unexpanded
        delete unexpanded[code];

    });
    //return remaining as unexpanded
    return (unexpanded)
}



//make a selection based on given children
function select_UCT(children){
//all options expanded, need to to UCT:
    var N = 0; //total people across all branches
    var uct_c = Math.sqrt(2); //constant for Monte Carlo UCT
    var uct_values = [];
    //go through each and build the UCT
    children.forEach(function(item){

        // get the sequence code from the name
        var name = item.node;
        var codes = name.split('-');
        var code = codes[codes.length -1];

        //augment total people
        N += item.people;
        var obj = {
            code: code,
            fitness:item.fitness_function,
            n: item.people };
        //add it to list
        uct_values.push(obj)
    });
    //TODO: ONCE we have that, pick with given likelihoods
    //likelihood given by UCT formula:
    var options = [];
    var likelihoods = [];
    uct_values.forEach(function(item){
        var p = item.fitness + uct_c * Math.sqrt( Math.log(N)/item.n);
        options.push(item.code);
        likelihoods.push(p)
    });
    var next_step = pick_random_with_likelihood(options,likelihoods);
    return(next_step);

}



//make a selection with probabilities
function pick_random_with_likelihood(pool,probs){


    //if we only have one option in the pool, return that option
    if (pool.length ==1){
        return (pool[0])
    }

    //if probs not sum to 1, normalize:
    var sum_array = 0
    for(var j = 0, length = probs.length; j < length; j++){
        sum_array += probs[j]
    }
    if (sum_array > 1){
        for(var j = 0, length = probs.length; j < length; j++){
            probs[j] = probs[j]*1.0/sum_array;
        }
    }
    //pick with probabilities
    var sum_p = 0;
    i = -1;
    //pick random from 0-1
    q = Math.random();
    while (sum_p <= q){
        i+= 1;
        sum_p += probs[i];
    }

    return (pool[i])
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


//given an item from the tileoscope_task_genetic_sequences or tree table,extract the pool as an object
// e.g {44_CaDo:44_CaDo, ... etc}
function decodeGeneticPoolTileoscope(data){

    var pool_data = {};
    var code_list = data.pool;
    //comma separated:
    code_list.split(',').forEach(function(item){
        pool_data[item] = item
    });
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


//Function filterResponses: filter array based on some criteria
function filterResponses(array, criteria) {
    return array.filter(function (obj) {
        return Object.keys(criteria).every(function (c) {
            return obj[c] == criteria[c];
        });})
};

//get all possible combinations of size s
function getCombinationsSize(arr,d) {


    var sequences = [];
    var n = arr.length;

    //init array of size n^d * d
    var matrix = new Array(Math.pow(n, d)*d).join('0').split('').map(parseFloat);

    for (var col = 1; col <= d; col++) {
        var row = 0;
        for (var iter = 1; iter <= Math.pow(n,col-1); iter++) {
            for (var symbol = 0; symbol < arr.length; symbol++) {
                for (var times = 1; times <= Math.pow(n,d-col); times++) {
                    //write symbol at cell [row,col]
                    //var ind = (col-1)* Math.pow(n,d) + row;
                    var ind = row*d + col -1;
                    matrix[ind] = symbol;
                    //row++
                    row++;
                }
            }
        }
    }

    //iterate over rows:
    for(var i = 0; i < Math.pow(n, d)*d; i += d) {

        var row_el = matrix.slice(i,i+d);
        var sArr = [];
        row_el.forEach(function(it){
            sArr.push(arr[it])
        })
        sequences.push(sArr.join('-'));
    }
    return(sequences)
}


