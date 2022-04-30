var db = require('../db/db');
var fs = require('fs');

var Promise = require('bluebird');
var databaseName = process.env.CARTO_DB_NAME;

//other db functions
var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');



//DB functions for Tileoscope and Tileoscope AR games


exports.addResponseTileoscope = function(userId, projectId, task_list, response) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var values_list = "";
        //for every item in the task list, make an item to add:
        for (var i = 0; i < task_list.length; i++) {

            //make sure we don't enter empty image
            if (task_list[i] != ""){
                var task = "\"" + task_list[i] + "\"";
                var vl = [userId,projectId,task,response,1]
                values_list += "(" + vl.toString() + "),"
            }


        }
        //remove last , from values_list
        values_list = values_list.slice(0, -1);

        connection.queryAsync('INSERT INTO response (user_id, project_id,task_id,response,site_id) VALUES ' + values_list).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.affectedRows);
                } else {
                    error({code: 'Problem with insert'});
                }
            }, function(err) {
                error(err);
            });
    });
};


exports.submitTileoscopeMove = function(userId, hitId, response) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('INSERT INTO tileoscope_moves (user_id, hit_id,response) VALUES(?,?,?) ',[userId,hitId,response]).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.affectedRows);
                } else {
                    error({code: 'Problem with insert'});
                }
            }, function(err) {
                error(err);
            });
    });
};


exports.submitTileoscopeCairn = function(userId, hitId, move) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var level_id = move.level_id;
        var level_number = parseInt(move.level);
        var message = move.move;

        console.log(level_id);
        console.log(level_number);
        console.log(message);


        connection.queryAsync('INSERT INTO `tileoscope_cairns` (user_id, hit_id,level_id,level_number,message) VALUES(?,?,?,?,?) ',[userId,hitId,level_id,level_number,message]).then(
            function(data) {
                if (data.insertId) {
                    console.log("Success")
                    resolve(data.affectedRows);
                } else {
                    error('Problem with insert');
                }
            }, function(err) {
                console.log(err)
                error(err);
            });
    });
};

exports.submitTileoscopePath = function(userId, hitId, response) {
    return new Promise(function(resolve, error) {
        var connection = db.get();


        var method = response.method;
        var seq = response.seq;
        var tiles_collected = response.tiles_collected;
        var times_completed = response.times_completed;
        var number_moves = response.number_moves;
        var number_mistakes = response.number_mistakes;
        var user_quit = response.user_quit;
        var unique_code_main = response.unique_code_main;

        connection.queryAsync('INSERT INTO tileoscope_paths (user_id, hit_id,method, seq,tiles_collected,times_completed,number_moves,number_mistakes,user_quit,unique_code_main) VALUES(?,?,?,?,?,?,?,?,?,?) ' +
            'ON DUPLICATE KEY UPDATE seq=VALUES(seq),tiles_collected=VALUES(tiles_collected),times_completed=VALUES(times_completed),' +
            'number_moves=VALUES(number_moves),number_mistakes=VALUES(number_mistakes),user_quit=VALUES(user_quit),unique_code_main=VALUES(unique_code_main)',
            [userId,hitId,method,seq,tiles_collected,times_completed,number_moves,number_mistakes,user_quit,unique_code_main]).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.affectedRows);
                } else {
                    error({code: 'Problem with insert'});
                }
            }, function(err) {
                error(err);
            });
    });
};

exports.getTileoscopePathUser = function(userId, hitId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_paths where user_id=? and hit_id=? ',[userId,hitId]).then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//get all paths for hit id (same as unique code)
exports.getTileoscopePaths = function(hitId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_paths where hit_id=? ORDER BY RAND()',[hitId]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

//get all paths for hit id (same as unique code)
exports.getTileoscopePathsRandom = function(hitId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_paths where hit_id=? and method="tree_random" ORDER BY RAND() LIMIT 50',[hitId]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.getTileoscopePathsQlearnO = function(hitId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_paths where hit_id=? and method="qlearnO" ORDER BY RAND()',[hitId]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


//get all paths that have been updated after the last time we updated the Qtable
exports.getTileoscopePathsRecent = function(hitId,timestamp) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_paths where hit_id=? and UNIX_TIMESTAMP(last_updated) > UNIX_TIMESTAMP(?)',[hitId,timestamp]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

//get recent cairns for that hit id
exports.getRecentCairns = function(hitId,num,user_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_cairns where hit_id=? and  user_id!=? order by id desc limit ? ',[hitId,user_id,num]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


//get recent cairns for that hit id
exports.getRecentCairnsLevel = function(hitId,num,user_id,level_number) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from tileoscope_cairns where hit_id=? and  user_id!=? and level_number=? order by id desc limit ? ',[hitId,user_id,level_number,num]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};



exports.submitTileoscopeARAction = function(session_id, short_name, response) {
    return new Promise(function(resolve, error) {
        var connection = db.get();



        connection.queryAsync('INSERT INTO tileoscope_ar_actions (session_id, short_name,action) VALUES(?,?,?) ',[session_id,short_name,response]).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.affectedRows);
                } else {
                    error({code: 'Problem with insert'});
                }
            }, function(err) {
                error(err);
            });
    });
};


exports.convertActionToMatch = function(projectID,workerId,matches,category_raw) {

    return new Promise(function(resolve, error) {

        if (projectID == undefined){
            error('Project code missing.');
        }
        else if (workerId == undefined){
            error('User code missing.');
        }
        else if (matches == undefined){
            error('Matches missing.');
        }
        else if (category_raw == undefined){
            error('Category missing.');
        }
        else {

            console.log(matches)
            if (typeof matches  == 'string') {
              var image_array = matches.split(",");

            } else {
              var image_array = matches;

            }


            //make the mturk user object
            var anonUser = {
                workerId: workerId,
                hitId:  "tileoscope_AR",
                assignmentId:  "tileoscope_AR",
                submitTo:  "tileoscope_AR"
            };

            //make sure there is a project
            projectDB.getSingleProjectFromCode(projectID).then(function(project) {

                var template = JSON.parse(project.template); //we need this to convert text answer to number answer
                var templ_options = template.options;
                var answers = [];
                templ_options.forEach(function(item){

                    answers.push(item.text.toLowerCase());
                });

                var category =  category_raw.replace(/_/gi," ").toLowerCase();
                var answer_decoded = answers.indexOf(category);

                //if answer invalid, return error
                if (answer_decoded == -1){
                    error('Invalid category.');
                } else {
                    //find user then return corresponding user id and project code
                    anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID, anonUser.hitId).then(function (user) {
                        if (user.id) {
                            //each vote needs: project_id, user_id, task_id (the image) and the response
                            exports.addResponseTileoscope(user.id, project.id, image_array, answer_decoded) .then(function (data) {
                                // console.log('data inserted', data);
                                resolve({user_id:user.id, project_code: projectID,items_added:data});
                            }).catch(function(err) {
                                console.log(err)
                                error({err: err.code || 'Could not submit response'});
                            });
                        } else {

                           //TODO: must first register user
                            anonUserDB.addMTurkWorker(anonUser, projectID, 1, 1, 0).then(function (userID) {
                                //find user then return corresponding user id and project code
                                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                                    if (user.id) {
                                        //each vote needs: project_id, user_id, task_id (the image) and the response
                                        exports.addResponseTileoscope(user.id, project.id, image_array, answer_decoded) .then(function (data) {
                                            // console.log('data inserted', data);
                                            resolve({user_id:user.id, project_code: projectID,items_added:data});
                                        }).catch(function(err) {
                                            console.log(err);
                                            error({err: err.code || 'Could not submit response'});
                                        });
                                    }
                                })
                            });
                        }
                    });

                }

            }, function(err) {
                console.log('err ', err);
                error({err: err.code || 'Project not found'});
            });
        }

    });




};



//get all the actions for a specific session
exports.getTileoscopeARActionsBySessionId = function(session_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_ar_actions where session_id=?  ', [session_id])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get all the actions for a specific dataset
exports.getTileoscopeARActionsByDataset = function(short_name) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT action from tileoscope_ar_actions where short_name=?  ', [short_name])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get all the moves for a specific trial
exports.getTileoscopeMoves = function(trialId) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_moves where hit_id=?  ', [trialId])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get tutorial items for unique code
exports.getTutorialItems = function(unique_code) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT unique_code,answer,explanation,image_name,image_attribution from tutorial where unique_code=?  ', [unique_code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get the active genetic tree for the given main code
exports.getCreatedSequenceTileoscope = function(id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_task_genetic_sequences where id=?  ', [id])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//get the simple sequence by unique code
exports.getTGSequencebyCode = function(unique_code) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_task_genetic_sequences where unique_code_main=?  ', [unique_code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};



//add a simple sequence with unique code
exports.addTGSequence = function(seq,seq_method,unique_code,level_pool) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('INSERT INTO tileoscope_task_genetic_sequences (unique_code_main,seq,active,method) VALUES (?,?,1,?)', [unique_code,seq,seq_method])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//get the simple pool by unique code
exports.getTGPoolbyCode = function(unique_code) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_genetic_tree where unique_code_main=?  ', [unique_code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};

//add a seq pool with unique code
exports.addTGSPool = function(seq,seq_method,unique_code,level_pool) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('INSERT INTO tileoscope_genetic_tree (unique_code_main,pool,active,node) VALUES (?,?,1,?)', [unique_code,level_pool,"start"])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};




//get the active genetic tree for the given main code
exports.pickSequenceFeaturedTileoscope = function(isMemory) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var ft = "featured"
        if (isMemory){
            ft += "_memory"
        }
        connection.queryAsync('SELECT id as genetic_id,seq,method from tileoscope_task_genetic_sequences where method="'+ ft +'" and active=1 ORDER BY RAND() LIMIT 1 ')
            .then(
                function(data) {
                    resolve(data[0]);
                }, function(err) {
                    error(err);
                });
    });
};




//reset the tree for a specific code
exports.resetTreeTileoscope = function(code) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('delete from tileoscope_genetic_tree where unique_code_main=?',[code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//update project status for ar
exports.updateARProjectStatus = function(code) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update projects set ar_status=1 where unique_code=?  ', [code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};


//update project status for ar
exports.setARStatus = function(code,status) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('update projects set ar_status=? where unique_code=?  ', [status,code])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};



//get all the projects that are Tileoscope Ready
exports.getTileoscopeARProjects = function() {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT name,short_name,short_name_friendly, description, short_description,unique_code,dataset_id,has_location,template,is_inaturalist from projects where ar_ready=1 and ar_status=1')
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};




//get all the projects that are Tileoscope Ready
exports.getTileoscopeProjectImageList = function(dataset_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var d_id = "dataset_" + dataset_id;

        connection.queryAsync('SELECT name,x,y from '+ d_id)
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};



//generate the dataset info json
exports.generateTileoscopeARDatasetInfoJSON = function(unique_code) {
    return new Promise(function(resolve, error) {


        var cat_colors_scheme = {
            1: '#9ACA3C',
            2: '#F5EA69',
            3: '#F7941D',
            4: '#DC1F3A',
            5: '#0072BC',
            6: '#8560A8'
        }

        var dataset_info_json = {
            categoriesCount: 0,         //number of categories
            categoriesLabel: [],        //categories
            categoriesColors: [],       //categories colors
            categoriesSample: [],       //representative image for each category (from tutorial table)
            code: unique_code,
            count: 0,                   //how many images in the set
            dataset_id: '',
            description: '',
            short_description: '',      //short description to show
            cartoscope_page_link: '',         //link to project page on Cartoscope
            filenames: [],              //names of images without extension
            has_location: 1,
            name: '',
            short_name: '',
            short_name_friendly: '',
            tutorial: [],                //at least one pair of images of the same category
            tutorial_explanations: [], //explanations for each tutorial item to be used
            is_inaturalist: 0
        };


        //first get the project, then get the name list, then get the tutorial images


        projectDB.getProjectFromCodeUnPub(unique_code).then(function(project_data) {


            var project = project_data[0];
           // console.log(project);

            var dataset_id = project.dataset_id;
            dataset_info_json.dataset_id = dataset_id;
            dataset_info_json.name = project.name;
            dataset_info_json.short_name = project.short_name;
            dataset_info_json.short_name_friendly = project.short_name_friendly;
            dataset_info_json.description = project.description;
            dataset_info_json.short_description = project.short_description || project.description;

            dataset_info_json.has_location = project.has_location;
            dataset_info_json.is_inaturalist = project.is_inaturalist;


            dataset_info_json.cartoscope_page_link = 'http://cartosco.pe/kioskProject.html#/kioskStart/' + unique_code ;


            //get categories and count here from template:

            var template_raw = JSON.parse(project.template);
            var categories_raw = template_raw.options;
            var categories =  [];
            var cat_colors = [];

            for (item in categories_raw){
                categories.push(categories_raw[item].text);
                var cat_num = categories_raw[item].color;
                cat_colors.push(cat_colors_scheme[cat_num]);

            }
            var categories_count = categories.length;

            //console.log(categories);
            //console.log(categories_count);

            dataset_info_json.categoriesCount = categories_count;
            dataset_info_json.categoriesLabel = categories;
            dataset_info_json.categoriesColors = cat_colors;


            //get all the filenames from the table
            projectDB.getDataSetNamesArray(dataset_id).then(function(image_list) {


                dataset_info_json.filenames = image_list;
                dataset_info_json.count = image_list.length;

                //get the tutorial items, images as is should
                projectDB.getTutorialFromCode(unique_code).then(function(tutorial_items) {

                    var tut_images = [];
                    var tut_categories = {};

                    var tut_explanation_array = [];


                    for(item in tutorial_items){

                        var tut = tutorial_items[item];


                        //console.log(tut)

                        var tut_image_raw = tut.image_name;
                        var tut_answer = tut.answer;
                        //remove extension and prefix from image name
                        var tut_image = tut_image_raw.substring(
                            tut_image_raw.lastIndexOf("/") + 1,
                            tut_image_raw.lastIndexOf(".")
                        );


                        //keep track of how many have more than one images
                        if (tut_categories.hasOwnProperty(tut_answer)) {


                            tut_categories[tut_answer].push(tut_image)

                        } else {
                            tut_categories[tut_answer] = [tut_image];

                        }

                        //PUSH INTO DATASET INFO THE TUTORIAL INFO AS WELL!
                        var expl_item = {};
                        expl_item.image_name = tut_image;
                        expl_item.answer = tut_answer;
                        expl_item.explanation = tut.explanation;
                        expl_item.image_attribution = tut.image_attribution;
                        tut_explanation_array.push(expl_item);

                    }


                        dataset_info_json.categoriesLabel.forEach(function(cat){
                            //use the first of each category as the representative
                            tut_images.push(tut_categories[cat][0]);

                            //TODO: Right now we are only pushing pairs to tutorial
                            if (tut_categories[cat].length >= 2) {

                                console.log("Adding images")
                                dataset_info_json.tutorial.push(tut_categories[cat][0]);
                                dataset_info_json.tutorial.push(tut_categories[cat][1]);

                            }
                        })


                    dataset_info_json.categoriesSample = tut_images;


                    //add tutorial explanation stuff here
                    dataset_info_json.tutorial_explanations = tut_explanation_array;


                    //send everything
                    resolve(dataset_info_json)


                }, function(err){
                    console.log("Error fetching image names from table")
                    console.log(err);
                    error(err)
                })





            }, function(err){
                console.log("Error fetching image names from table")
                console.log(err);
                error(err)
            })




        }, function(err){
            console.log("Error fetching project from code")
                console.log(err);
                error(err)
            })


    });
};


exports.updateTileoscopeARDatasetInfoJSONFile = function(unique_code) {

    return new Promise(function(resolve, error) {


        exports.generateTileoscopeARDatasetInfoJSON(unique_code).then(function (json_data) {

            var datasetDIR = "dataset/" + json_data.dataset_id;
            var dataset_file = datasetDIR + '/Dataset-Info.json';
            var json = JSON.stringify(json_data, null, 2);
            fs.writeFile(dataset_file, json, 'utf8', (err) => {
                if (err) {
                    error(err)
                }
                console.log('dataset-info file was created');
                //set ar  status to 1
                exports.updateARProjectStatus(unique_code).then(function (d) {
                    resolve(json_data)
                });
            });

        }, function (error) {
            console.log(error);
            error(err)
        })


    })

};

