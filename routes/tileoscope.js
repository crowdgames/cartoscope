var resultDB = require('../db/results');
var anonUserDB = require('../db/anonUser');
var projectDB = require('../db/project');
var tileDB = require('../db/tileoscope');
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