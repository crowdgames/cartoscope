

var resultDB = require('../db/results');
var anonUserDB = require('../db/anonUser');
var projectDB = require('../db/project');
var tileDB = require('../db/tileoscope');
var dynamicDB = require('../db/dynamic');
var Promise = require('bluebird');

var filters = require('../constants/filters');
var express = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();
var fs = require('fs');
var archiver = require('archiver');
var json2csv = require('json2csv');
var d3 = require('d3');
var CARTO_PORT = process.env.CARTO_PORT || '8081';
var path = require('path');
module.exports = router;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {


        console.log("in storage disk")

        var path_to_store = path.join(__dirname, '../', 'temp');
        cb(null, path_to_store)
    },
    filename: function (req, file, cb) {
        console.log(file)
        var extArray = file.originalname.split(".");
        var extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '_' + Date.now()+ '.' +extension)
    }
})
const fupload = multer({ storage: storage });


//API Calls for Tileoscope and Tileoscope AR games



// Register tileoscope User to Cartoscope Code
router.post('/registerTileoscopeUser', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.body.project_code;
    var workerId = req.body.user_code;


    if (projectID == undefined){
        res.status(400).send('Project code missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    } else {
        //make the mturk user object
        var anonUser = {
            workerId: req.body.user_code,
            hitId: req.body.hitId || "tileoscope_AR",
            assignmentId: req.body.assignmentId || "tileoscope_AR",
            submitTo: req.body.submitTo || "tileoscope_AR"
        };

        //make sure there is a project
        projectDB.getSingleProjectFromCode(projectID).then(function(project) {
            //add them as mturk worker and return user id and project code
            anonUserDB.addMTurkWorker(anonUser, projectID, 1, 1, 0).then(function (userID) {
                    //find user then return corresponding user id and project code
                    anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                        if (user.id) {
                            res.status(200).send({user_id:user.id, project_code: projectID});
                        }
                    })
            });

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No project found.');
        });
    }

});


// Register tileoscope User to Cartoscope Code
router.get('/registerTileoscopeUser', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.query.project_code;
    var workerId = req.query.user_code;


    if (projectID == undefined){
        res.status(400).send('Project code missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    } else {
        //make the mturk user object
        var anonUser = {
            workerId: req.query.user_code,
            hitId: req.query.hitId || "tileoscope_AR",
            assignmentId: req.query.assignmentId || "tileoscope_AR",
            submitTo: req.query.submitTo || "tileoscope_AR"
        };

        //make sure there is a project
        projectDB.getSingleProjectFromCode(projectID).then(function(project) {
            //add them as mturk worker and return user id and project code
            anonUserDB.addMTurkWorker(anonUser, projectID, 1, 1, 0).then(function (userID) {
                //find user then return corresponding user id and project code
                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                    if (user.id) {
                        res.status(200).send({user_id:user.id, project_code: projectID});
                    }
                })
            });

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No project found.');
        });
    }

});


//Get Cartoscope User id and project code from Tileoscope User uuid
router.post('/getTileoscopeUser', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.body.project_code;
    var workerId = req.body.user_code;


    if (projectID == undefined){
        res.status(400).send('Project code missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    } else {
        //make the mturk user object
        var anonUser = {
            workerId: req.body.user_code,
            hitId: req.body.hitId || "tileoscope_AR",
            assignmentId: req.body.assignmentId || "tileoscope_AR",
            submitTo: req.body.submitTo || "tileoscope_AR"
        };

        //make sure there is a project
        projectDB.getSingleProjectFromCode(projectID).then(function(project) {
            //add them as mturk worker and return user id and project code
                //find user then return corresponding user id and project code
                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                    if (user.id) {
                        res.status(200).send({user_id:user.id, project_code: projectID});
                    } else {
                        res.status(404).send("User not found")
                    }
                })

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No project found.');
        });
    }

});



//Register tileoscope User to Cartoscope Code
router.post('/submitMatch', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.body.project_code;
    var workerId = req.body.user_code;

    //also need category and array of images:
    var category_raw = req.body.category;


    if (projectID == undefined){
        res.status(400).send('Project code missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    }
    else if (req.body.matches == undefined){
        res.status(400).send('Matches missing.');
    }
    else if (category_raw == undefined){
        res.status(400).send('Category missing.');
    }
    else {

        var image_array = req.body.matches.split(",");


        //make the mturk user object
        var anonUser = {
            workerId: req.body.user_code,
            hitId: req.body.hitId || "tileoscope_AR",
            assignmentId: req.body.assignmentId || "tileoscope_AR",
            submitTo: req.body.submitTo || "tileoscope_AR"
        };

        //make sure there is a project
        projectDB.getSingleProjectFromCode(projectID).then(function(project) {

            var template = JSON.parse(project.template); //we need this to convert text answer to number answer
            var templ_options = template.options;
            console.log(templ_options);
            var answers = [];
            templ_options.forEach(function(item){

                answers.push(item.text.toLowerCase());
            });

            var category =  category_raw.replace(/_/gi," ").toLowerCase();
            var answer_decoded = answers.indexOf(category);

            //if answer invalid, return error
            if (answer_decoded == -1){
                res.status(400).send('Invalid category.');
            } else {
                //find user then return corresponding user id and project code
                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID, anonUser.hitId).then(function (user) {
                    if (user.id) {
                        //each vote needs: project_id, user_id, task_id (the image) and the response
                        tileDB.addResponseTileoscope(user.id, project.id, image_array, answer_decoded) .then(function (data) {
                                // console.log('data inserted', data);
                            res.status(200).send({user_id:user.id, project_code: projectID,items_added:data});
                            }).catch(function(err) {
                                console.log(err)
                                res.status(500).send({err: err.code || 'Could not submit response'});
                            });
                    } else {
                        res.status(404).send("user not found")
                    }
                });

            }

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No project found.');
        });
    }
});




//Register tileoscope User to Cartoscope Code
router.post('/submitMove', function(req, res, next) {


    //if one of the two missing, then error!
    var hitId = req.body.hitID;
    var workerId = req.body.userID;
    var move = req.body.move;



    if (hitId == undefined){
        res.status(400).send('Trial ID missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    }  else if (move == undefined){
        res.status(400).send('Move missing.');
    }

    else {


        //make sure there is a project
        tileDB.submitTileoscopeMove(workerId,hitId,move).then(function(project) {

            res.status(200).send('Move submitted successfully');

        }, function(err) {
            console.log('err ', err);
            res.status(400).send('Error submitting move.');
        });
    }
});


//Submit Tile-o-Scope AR action
router.post('/submitTileoscopeARAction', function(req, res, next) {


    console.log(req.body)
    //if one of the two missing, then error!
    var session_id = req.body.sessionid;
    var action = req.body.action;
    var short_name = req.body.datasetName;



    if (session_id == undefined){
        res.status(404).send('Session ID missing.');
    }
    else if (action == undefined){
        res.status(404).send('Action info missing.');
    }

    else {


        //make sure there is a project
        tileDB.submitTileoscopeARAction(session_id,short_name,action).then(function(d) {


            //if correct, need to convert to vote
            try {
                var item = JSON.parse((action));
                var session_id = item.sessionid;
                var isMatch = item.isMatch;
                var short_name = item.datasetName;
                var code = item.code;
                var user_code = session_id; //user code is the session id
                var matches = item.ImageIds;
                var category = item.MatchCategory;

                if (isMatch && short_name && code && code != "_"){
                    console.log("Add vote as Carttoscope")
                    //Tadd it as vote as well for the map!
                    tileDB.convertActionToMatch(code,user_code,matches,category).then(function(d) {

                        res.status(200).send('Tile-o-Scope AR Action submitted successfully');


                    }, function(err) {
                        console.log('err ', err);
                        res.status(400).send('Error submitting Tile-o-Scope AR action.');
                    });

                } else {
                  console.log("Don't add vote as Carttoscope")

                    res.status(200).send('Tile-o-Scope AR Action submitted successfully');

                }

            } catch (e) {
                console.log("not valid json");
                res.status(400).send('Not valid JSON');

            }



        }, function(err) {
            console.log('err ', err);
            res.status(400).send('Error submitting Tile-o-Scope AR action.');
        });
    }
});


//Register tileoscope User to Cartoscope Code
router.get('/submitMatch', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.query.project_code;
    var workerId = req.query.user_code;


    var category_raw = req.query.category;


    if (projectID == undefined){
        res.status(400).send('Project code missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    }
    else if (req.query.matches == undefined){
        res.status(400).send('Matches missing.');
    }
    else if (category_raw == undefined){
        res.status(400).send('Category missing.');
    }
    else {

        //also need category and array of images:
        var image_array = req.query.matches.split(",");



        //make the mturk user object
        var anonUser = {
            workerId: req.query.user_code,
            hitId: req.query.hitId || "tileoscope_AR",
            assignmentId: req.query.assignmentId || "tileoscope_AR",
            submitTo: req.query.submitTo || "tileoscope_AR"
        };

        //make sure there is a project
        projectDB.getSingleProjectFromCode(projectID).then(function(project) {

            var template = JSON.parse(project.template); //we need this to convert text answer to number answer
            var templ_options = template.options;
            console.log(templ_options);
            var answers = [];
            templ_options.forEach(function(item){

                answers.push(item.text.toLowerCase());
            });

            var category =  category_raw.replace(/_/gi," ").toLowerCase();
            var answer_decoded = answers.indexOf(category);

            //if answer invalid, return error
            if (answer_decoded == -1){
                res.status(400).send('Invalid category.');
            } else {
                //find user then return corresponding user id and project code
                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID, anonUser.hitId).then(function (user) {
                    if (user.id) {
                        //each vote needs: project_id, user_id, task_id (the image) and the response
                        tileDB.addResponseTileoscope(user.id, project.id, image_array, answer_decoded) .then(function (data) {
                            // console.log('data inserted', data);
                            res.status(200).send({user_id:user.id, project_code: projectID,items_added:data});
                        }).catch(function(err) {
                            console.log(err)
                            res.status(500).send({err: err.code || 'Could not submit response'});
                        });
                    } else {
                        res.status(404).send("user not found")
                    }
                });

            }

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No project found.');
        });
    }
});


//Get Cartoscope User votes from Tileoscope User uuid
router.post('/getTileoscopeUserVotes', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.body.project_code;
    var workerId = req.body.user_code;


    if (projectID == undefined){
        res.status(400).send('Project code missing.');
    }
    else if (workerId == undefined){
        res.status(400).send('User code missing.');
    } else {
        //make the mturk user object
        var anonUser = {
            workerId: workerId,
            hitId: req.body.hitId || "tileoscope_AR",
            assignmentId: req.body.assignmentId || "tileoscope_AR",
            submitTo: req.body.submitTo || "tileoscope_AR"
        };

        //make sure there is a project
        projectDB.getSingleProjectFromCode(projectID).then(function(project) {
            //add them as mturk worker and return user id and project code
            //find user
            anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                if (user.id) {

                    //if valid user, get their votes and return them:
                    resultDB.heatMapDataAllUser(projectID,project.dataset_id,user.id).then(function(data_res) {

                        res.send(data_res)

                    }, function(err) {
                        console.log('err ', err);
                        res.status(404).send('No votes found.');
                    })


                } else {
                    res.status(404).send("User not found")
                }
            })

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No project found.');
        });
    }

});



//Get Tileoscope moves for specific hit
router.get('/getTileoscopeMoves/:hitId', function(req, res, next) {


    //if one of the two missing, then error!
    var hitId = req.params.hitId;

        //make sure there is a project
        tileDB.getTileoscopeMoves(hitId).then(function(moves) {

            res.send(moves);

        }, function(err) {
            console.log('err ', err);
            res.status(404).send('No trial found.');
        });


});


//Get Tileoscope AR actions for specific session id
router.get('/getARActionsBySessionID/:session_id', function(req, res, next) {

    //if one of the two missing, then error!
    var session_id = req.params.session_id;
    //make sure there is a project
    tileDB.getTileoscopeARActionsBySessionId(session_id).then(function(actions) {
        res.send(actions);
    }, function(err) {
        console.log('err ', err);
        res.status(404).send('No trial found.');
    });


});




//Get Tileoscope AR actions for specific session id
router.get('/generateQlearnOptimalSequenceTileoscope/:main_code', function(req, res, next) {

    //if one of the two missing, then error!
    var main_code = req.params.main_code;
    //make sure there is a project
    dynamicDB.generateQlearnOptimalSequenceTileoscope(main_code).then(function(data) {
        res.send(data);
    }, function(err) {
        console.log('err ', err);
        res.status(404).send('No trial found.');
    });


});



//Get Tileoscope AR actions for specific session id
router.get('/getARActionsByDataset/:dataset', function(req, res, next) {


    //if one of the two missing, then error!
    var dataset = req.params.dataset;

    //make sure there is a project
    tileDB.getTileoscopeARActionsByDataset(dataset).then(function(actions) {

        res.send(actions);

    }, function(err) {
        console.log('err ', err);
        res.status(404).send('No trial found.');
    });


});


//TODO: Batch submit matches when user comes back online


//filters.requireLogin
router.post('/uploadOfflineActionsAR', fupload.single('file'),
    function(req, res, next) {

        var session_id = req.body.projectID;
        console.log(req.file)
        var stored_filename = req.file.path;
        console.log(stored_filename);


        readLines(stored_filename).then(function (actions) {


            //proceed to analyze the actions
            pArr = [];

            actions.forEach(function(item){

                try {
                    var action = JSON.parse((item));
                    var session_id = action.sessionid;
                    var isMatch = action.isMatch;
                    var short_name = action.datasetName;
                    var code = action.code;
                    var user_code = session_id; //user code is the session id
                    var matches = action.ImageIds;
                    var category = action.MatchCategory;

                    //at all times, must add the action
                    var p = tileDB.submitTileoscopeARAction(session_id,short_name,item);
                    //catch and print error but do not cause problem
                    p.catch(function (err) {
                        console.log(err)
                    });
                    pArr.push(p);

                    if (isMatch && short_name && code && code != '_'){
                        //TODO: add it as vote as well for the map!
                        var p2 = tileDB.convertActionToMatch(code,user_code,matches,category);
                        p2.catch(function (err) {
                            console.log(err)
                        });
                        pArr.push(p2);
                    }

                } catch (e) {
                    console.log("not valid json");
                }

            });

            Promise.all(pArr).then(function (data) {
                console.log("Done adding updates");

                //delete original  file
                fs.unlink(stored_filename, (err) => {
                    // if (err) throw err;
                    console.log('Original file was deleted');
                    res.status(200).send("Offline actions updated succesfuly")

                });


            });



        })
    });

//read json line by line
function readLines(fName){
    return new Promise(function(resolve, reject) {
        console.log("Will read json: " + fName);
        var lines = [];
        //read json file using d3

        if (fName.endsWith('.json')){
            fs.readFile(fName, 'utf8', function (err, data) {

                if (err) {
                    reject(err)
                }

                var array = data.toString().split("\n");
                for(i in array) {
                    lines.push(array[i])
                }
                resolve(lines)
            });
        } else {
            resolve([])
        }

    }).catch(function(err) {
        console.log("HERE")
        reject(err);
    });

}


// Get a generated sequence for Tilescope Web
router.get('/getSequenceTileoscopeWeb/', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.query.tree || req.query.qlearn ||req.query.qlearng  || req.query.genetic || req.query.random || "featured";
    var workerId = req.query.workerId || req.query.participantId;



    if (workerId == undefined){
        res.status(400).send('User code missing.');
    } else {
        //make the mturk user object
        var anonUser = {
            workerId: workerId,
            hitId: req.query.hitId || req.query.trialId ||  "tileoscope",
            assignmentId: req.query.assignmentId || "tileoscope",
            submitTo: req.query.submitTo || "tileoscope"
        };


        //for cases requiring trees (or generating from pools that are stored in the root of a tree)
        if (req.query.hasOwnProperty("tree") || req.query.hasOwnProperty("random")){
            //make sure there is a tree
            dynamicDB.getTreeFromCodeTileoscope(projectID).then(function(tree) {

                console.log("Tree exists.");

                //check if user exists:
                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                    if (user.id) {
                        console.log("User exists.Fetching sequence")
                        //res.status(200).send({user_id:user.id, project_code: projectID});
                        //retrieve from genetic id
                        tileDB.getCreatedSequenceTileoscope(user.genetic_id).then(function(genetic_data) {

                            res.setHeader('Access-Control-Allow-Origin', '*');
                            var res_obj = {seq:genetic_data[0].seq,method:genetic_data[0].method};
                            res.send(res_obj)

                        }, function(error){

                            res.status(400).send("Error retrieving sequence for existing user.")

                        });


                    } else {
                        //get genetic code from backend

                        console.log("User not found. Creating...");

                        var func = "createUserSequenceFromTreeTileoscope";
                        if (req.query.hasOwnProperty("random")){
                            func = "createUserSequenceFromTreeTileoscopeRandom"
                        }

                        dynamicDB[func](projectID).then(function(genetic_data){

                            console.log(genetic_data);
                            var genetic_id = genetic_data.genetic_id;
                            var genetic_seq = genetic_data.seq;
                            //add them as mturk worker and return genetic sequence
                            anonUserDB.addMTurkWorker(anonUser, projectID, 1, 1, genetic_id).then(function (userID) {
                                //find user then return corresponding user id and project code
                                anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                                    if (user.id) {
                                        //res.status(200).send({user_id:user.id, project_code: projectID});
                                        res.setHeader('Access-Control-Allow-Origin', '*');
                                        var res_obj = {seq:genetic_data.seq,method:genetic_data.method};
                                        res.send(res_obj)
                                    }
                                })
                            });

                        },function(err) {
                            console.log('err ', err);
                            res.status(404).send('Could not generate sequence.');
                        });
                    }
                })




            }, function(err) {
                console.log('err ', err);
                res.status(404).send('No tree found.');
            });
        }
        //for for cases that don't require tree
        else if (req.query.hasOwnProperty("qlearn") || req.query.hasOwnProperty("qlearng") || req.query.hasOwnProperty("genetic")){

            //check if user exists:
            anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                if (user.id) {
                    console.log("User exists.Fetching sequence")
                    //res.status(200).send({user_id:user.id, project_code: projectID});
                    //retrieve from genetic id
                    tileDB.getCreatedSequenceTileoscope(user.genetic_id).then(function(genetic_data) {

                        res.setHeader('Access-Control-Allow-Origin', '*');
                        var res_obj = {seq:genetic_data[0].seq,method:genetic_data[0].method};
                        res.send(res_obj)

                    }, function(error){

                        res.status(400).send("Error retrieving sequence for existing user.")

                    });


                } else {
                    //get sequence by picking between randomly generating or qlearn optimal

                    console.log("User not found. Creating...");
                    var gen_q = 0;

                    var func = "createUserSequenceQlearnTileoscope";
                    if (req.query.hasOwnProperty("genetic")){
                        func = "pickGeneticSequenceTileoscope"
                    }
                    if (req.query.hasOwnProperty("qlearng")) {
                        gen_q = 1
                    }

                    dynamicDB[func](projectID,gen_q).then(function(genetic_data){

                        console.log(genetic_data);
                        var genetic_id = genetic_data.genetic_id;
                        var genetic_seq = genetic_data.seq;
                        //add them as mturk worker and return genetic sequence
                        anonUserDB.addMTurkWorker(anonUser, projectID, 1, 1, genetic_id).then(function (userID) {
                            //find user then return corresponding user id and project code
                            anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                                if (user.id) {
                                    //res.status(200).send({user_id:user.id, project_code: projectID});
                                    res.setHeader('Access-Control-Allow-Origin', '*');
                                    var res_obj = {seq:genetic_data.seq,method:genetic_data.method};
                                    res.send(res_obj);
                                }
                            })
                        });

                    },function(err) {
                        console.log('err ', err);
                        res.status(404).send('Could not generate sequence.');
                    });
                }
            })


        } else {

            console.log("Featured");

            //check if user exists:
            anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                if (user.id) {
                    console.log("User exists.Fetching sequence")
                    //res.status(200).send({user_id:user.id, project_code: projectID});
                    //retrieve from genetic id
                    tileDB.getCreatedSequenceTileoscope(user.genetic_id).then(function(genetic_data) {

                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.send(genetic_data[0].seq)

                    }, function(error){

                        res.status(400).send("Error retrieving sequence for existing user.")

                    });


                } else {
                    //get sequence by picking one of the currently featured ones

                    console.log("User not found. Creating...");


                    tileDB.pickSequenceFeaturedTileoscope().then(function(genetic_data){

                        console.log(genetic_data);
                        var genetic_id = genetic_data.genetic_id;
                        var genetic_seq = genetic_data.seq;
                        //add them as mturk worker and return genetic sequence
                        anonUserDB.addMTurkWorker(anonUser, projectID, 1, 1, genetic_id).then(function (userID) {
                            //find user then return corresponding user id and project code
                            anonUserDB.findConsentedMTurkWorker(anonUser.workerId, projectID,anonUser.hitId).then(function(user) {
                                if (user.id) {
                                    //res.status(200).send({user_id:user.id, project_code: projectID});
                                    res.setHeader('Access-Control-Allow-Origin', '*');
                                    var res_obj = {seq:genetic_data.seq,method:genetic_data.method};
                                    res.send(res_obj)
                                }
                            })
                        });

                    },function(err) {
                        console.log('err ', err);
                        res.status(404).send('Could not generate sequence.');
                    });
                }
            })


        }


    }

});


// update the tree using the data provided (source: R code)
router.post('/updateGeneticTreeFromRDATA/:mainCode', function(req,res,next){


    var main_code = req.params.mainCode;
    var updated_tree = req.body.tree;

    //delete tree before and add new
    tileDB.resetTreeTileoscope(main_code).then(function (d) {
        dynamicDB.updateTreeFromDATATileoscope(updated_tree).then(function(data) {
            res.status(200).send("Tileoscope Tree updated from R data sucessfully")
        }, function(error){
            console.log(error)
            res.status(404).send(error)
        })
    })



});




// update the tree using the data provided (source: R code)
router.post('/resetTreeTileoscope/:mainCode', function(req,res,next){


    var main_code = req.params.mainCode;

    tileDB.resetTreeTileoscope(main_code).then(function(data) {
        res.status(200).send("Tileoscope Tree updated from R data successfully")
    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })

});



// get the projects that are AR ready from DB
router.get('/getTileoscopeARProjects', function(req,res,next){


    tileDB.getTileoscopeARProjects().then(function(data) {

        var d = [];
        data.forEach(function(item){
            if (item.short_name && item.unique_code){
                d.push(item.unique_code + '_' + item.short_name)
            }
        });

        var obj = {'names':d};
        res.send(obj)
    }, function(error){
        console.log(error);
        res.status(404).send(error)
    })


});


// get the projects that are AR ready from DB
router.get('/getTileoscopeARProjectImageList/:mainCode', function(req,res,next){

    var main_code = req.params.mainCode;

    //get dataset id from code
    projectDB.getDatasetIdFromCode(main_code).then(function(dd) {

            var dataset_id = dd[0].dataset_id;
            //get dataset id from code
        tileDB.getTileoscopeProjectImageList(dataset_id).then(function(data) {
            res.send(data)

        }, function(error){
            console.log(error)
            res.status(404).send(error)
        })


    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })


});


//get specific image from dataset
router.get('/getImage/:dataset/:name' , function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');
    if (fs.existsSync('dataset/' + req.params.dataset + '/' + req.params.name + '.jpg')) {
        res.sendFile(path.resolve('dataset/' + req.params.dataset + '/' + req.params.name + '.jpg'));
    } else {
        res.status(404).send();
    }
});


//get specific image from dataset
router.get('/getImageJson/:dataset/:name' , function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if (fs.existsSync('dataset/' + req.params.dataset + '/' + req.params.name + '.json')) {
        res.sendFile(path.resolve('dataset/' + req.params.dataset + '/' + req.params.name + '.json'));
    } else {
        res.status(404).send();
    }
});




//generate dataset info for existing code
router.get('/generateDatasetInfo/:code' , function(req, res, next) {


    tileDB.generateTileoscopeARDatasetInfoJSON(req.params.code).then(function(json_data) {

        var datasetDIR = "dataset/" + json_data.dataset_id;
        var dataset_file = datasetDIR+ '/Dataset-Info.json';
        var json = JSON.stringify(json_data,null,2);
        fs.writeFile(dataset_file, json, 'utf8', (err) => {
            if (err) {
                res.status(404).send(err)
            }
            console.log('dataset-info file was created');
            //set ar  status to 1
            tileDB.updateARProjectStatus(req.params.code).then(function (d) {
                res.send(json_data)
            });
        });



    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })
});






//get specific dataset zip
router.get('/getDataset/:code/' , function(req, res, next) {


    var ar_folder = "ar_zip/";
    //if it doesn't exist, then create it, else add to it
    if (!fs.existsSync(ar_folder)) {
        fs.mkdirSync(ar_folder);
    }

    var unique_code = req.params.code;

    projectDB.getProjectFromCode(unique_code).then(function (project_data) {


        var project = project_data[0];

        var dataset_id = project.dataset_id;
        var datasetDIR = "dataset/" + dataset_id;
        var zip_name = project.unique_code + "_" + project.short_name + '.zip';
        var full_zip = ar_folder + zip_name;
        console.log(full_zip)

        // //make sure we don't send anything beyond json and image
        // if (fs.existsSync(datasetDIR + "/tmp/")) {
        //     fs.unlinkSync(datasetDIR + "/tmp/");
        // }



            var output = fs.createWriteStream(full_zip);
            var archive = archiver('zip');


            output.on('close', function () {

                //we have it, just send it
                //res.setHeader('Content-Type', 'application/zip');
                //res.sendFile(path.resolve(full_zip));
                res.download(full_zip, zip_name);



            });

            archive.on('error', function(err){
                res.status(404).send("Could not generate zip");
            });

            // pipe archive data to the file
            archive.pipe(output);
            // append files from a sub-directory, putting its contents at the root of archive
            archive.directory(datasetDIR, false);
            archive.finalize();







    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })



});



//get specific dataset zip
router.get('/getDatasetInfo/:code' , function(req, res, next) {


    var code = req.params.code;
    tileDB.generateTileoscopeARDatasetInfoJSON(code).then(function(data) {

        var json = JSON.stringify(data,null,2);


        res.send(json)

    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })
});
