var resultDB = require('../db/results');
var anonUserDB = require('../db/anonUser');
var projectDB = require('../db/project');
var tileDB = require('../db/tileoscope');
var dynamicDB = require('../db/dynamic');

var filters = require('../constants/filters');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var json2csv = require('json2csv');
var d3 = require('d3');
var CARTO_PORT = process.env.CARTO_PORT || '8081';
var path = require('path');
module.exports = router;


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


// Get a generated sequence for Tilescope Web
router.get('/getSequenceTileoscopeWeb/', function(req, res, next) {


    //if one of the two missing, then error!
    var projectID = req.query.tree || req.query.qlearn || req.query.genetic || req.query.random || "featured";
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
        else if (req.query.hasOwnProperty("qlearn") || req.query.hasOwnProperty("genetic")){

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

                    var func = "createUserSequenceQlearnTileoscope";
                    if (req.query.hasOwnProperty("genetic")){
                        func = "pickGeneticSequenceTileoscope"
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
    var updated_tree = req.body.tree

    dynamicDB.updateTreeFromDATATileoscope(updated_tree).then(function(data) {
        res.status(200).send("Tileoscope Tree updated from R data sucessfully")
    }, function(error){
        console.log(error)
        res.status(404).send(error)
    })


});