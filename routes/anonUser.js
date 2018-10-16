/**
 * Created by kiprasad on 11/10/16.
 */
var express = require('express');
var router = express.Router();
module.exports = router;
var filters = require('../constants/filters');
var Promise = require('bluebird');
var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');
var resultDB = require('../db/results');
var querystring = require('querystring');
var path = require('path');
var randomString = require('randomstring');
var bcrypt = require('bcrypt');
var salt = process.env.CARTO_SALT;


router.get('/startAnon/:pCode',
  [filters.requiredParamHandler(['workerId', 'assignmentId', 'hitId', 'submitTo'])],
  function(req, res, next) {
  //console.log('req.query ', req.query);
    var workerId = req.query.workerId;
    var projectID = req.params.pCode;
    var hitId = req.query.hitId;
    var assignmentId = req.query.assignmentId;
    var chain = req.query.chain;
    var fromChain = req.query.fromChain;
    var genetic = req.query.genetic; //whether the task is genetic


    projectDB.getSingleProjectFromCode(projectID).then(function(project) {
      req.logout();
      anonUserDB.findConsentedMTurkWorker(workerId, projectID,hitId).then(function(user) {
        if (user.id) {
            loginAnonUser(req, user).then(function(data) {
                var red_link = '/api/tasks/startProject/' + req.params.pCode + '?chain=' + chain;
                //if genetic, we need to add genetic ID to user
                if (genetic){
                    red_link += '&genetic=1';
                }
            res.redirect(red_link);
          });
        } else {

            //if coming from chain, loginUser without hashing,create the progress then continue
            //ONLY AT MTURK!
            if (fromChain) {

                console.log("Will add without hash");

                //add user without hash
                anonUserDB.addMTurkWorkerNoHash(req.query, req.params.pCode, 1, 1).then(function(usernohash){
                    req.logout();
                    //add progress
                    projectDB.startNewProgress(workerId, project.id, 1).then(
                        function(newProgress) {
                            //find user
                            anonUserDB.findConsentedMTurkWorkerFromHash(workerId, projectID).then(function(user) {
                                if (user.id) {
                                    //console.log('user object ', user)
                                    loginAnonUser(req, user).then(function(data) {
                                        res.redirect('/api/tasks/startProject/' + req.params.pCode + '?chain=' + chain);
                                    });

                                } else {
                                    res.redirect('/consentForm.html#/consent?project=' + req.params.pCode + '&' +
                                        querystring.stringify(req.query));
                                }
                            }, function(error) {
                                res.status(500).send({error: error.code});
                            });
                        }, function(err) {
                            error(err);
                        });

                });

            } else {

                console.log("Not logged in")

                var red_link = '/consentForm.html#/consent?project=' + req.params.pCode + '&' +
                    querystring.stringify(req.query);
                res.redirect(red_link);
            }

        }
      }, function(error) {
        res.status(500).send({error: error.code});
      });
      
    }, function(err) {
      res.status(500).send({error: err.code || 'Invalid project code'});
    });
  });



router.get('/startMturkRandom/',
    [filters.requiredParamHandler(['workerId', 'assignmentId', 'hitId', 'submitTo'])],
    function(req, res, next) {
        //console.log('req.query ', req.query);
        var workerId = req.query.workerId;
        var hitId = req.query.hitId;
        //check if we must chain tasks for mturk
        var chain_tasks = req.query.chain || -1;
        //add it back to query if not existing
        req.query.chain = chain_tasks;

        projectDB.getRandomProjectMturk().then(function(projectID) {
            req.logout();
            anonUserDB.findConsentedMTurkWorker(workerId, projectID,hitId).then(function(user) {
                if (user.id) {
                    //console.log('user object ', user)
                    loginAnonUser(req, user).then(function(data) {
                        res.redirect('/api/tasks/startProject/' + projectID);
                    });

                } else {
                    res.redirect('/consentForm.html#/consent?project=' + projectID + '&' +
                        querystring.stringify(req.query));
                }
            }, function(error) {
                res.status(500).send({error: error.code});
            });

        }, function(err) {
            res.status(500).send({error: err.code || 'Invalid project code'});
        });
    });



router.get('/startKiosk/',
    [filters.requiredParamHandler([])],
    function(req, res, next) {
        // generate a worker id
        req.logout();
        var workerId = generateUniqueWorkerId();
        var randomProjectIndex;
        var projectID;
        console.log('workerId ', workerId);
        //select a project list from all public projects
        projectDB.getAllPublicProjects().then(function(projects){
            // projects = ["TyGxf0Jo1cno", "TyGxf0Jo1cno", "TyGxf0Jo1cno"];
            projects = ["ASNWK1dZEY1z", "RPoFzDjhHLdV"];
            randomProjectIndex = Math.floor(Math.random() * (projects.length));
           // console.log(randomProjectIndex);
            projectID = projects[randomProjectIndex];
            //console.log("ProjectID", projectID);

            //randomProjectIndex = Math.floor(Math.random() * (projects.length - 0 + 1)) + min;
            //projectID = projects[randomProjectIndex].unique_code;
            //projectID="fGEYOud7NX8z";
            //projectID="HD7xtmjClIyK";

            projectDB.getSingleProjectFromCode(projectID).then(function(project) {
                req.logout();
                anonUserDB.findConsentedKioskWorker(workerId, projectID).then(function(user) {
                    if (user.id) {
                        console.log('user object ', user);
                        loginAnonKioskUser(req, user).then(function(data) {
                            res.redirect('/api/tasks/startProject/' + projectID);
                        });

                    } else {
                        console.log('user object ', user)
                        res.status(200).send({projectID: projectID, workerID : workerId, project: project});
                    }
                }, function(error) {
                    console.log('error ', error)
                    res.status(500).send({error: error.code});
                });

            }, function(err) {
              console.log('err ', err);
                res.status(500).send({error: err.code || 'Invalid project code'});
            });

        });

    });

router.get('/startKioskProject/:pCode',
    [filters.requiredParamHandler([])],
    function(req, res, next) {
        // generate a worker id
        req.logout();
        var workerId = generateUniqueWorkerId();
        var projectID = req.params.pCode;
        console.log('workerId ', workerId);
        //select a project list from all public projects

        projectDB.getSingleProjectFromCode(projectID).then(function(project) {
                req.logout();
                anonUserDB.findConsentedKioskWorker(workerId, projectID).then(function(user) {
                    if (user.id) {
                        console.log('user object ', user);
                        loginAnonKioskUser(req, user).then(function(data) {
                            res.redirect('/api/tasks/startProject/' + projectID);
                        });

                    } else {
                        console.log('user object ', user)
                        res.status(200).send({projectID: projectID, workerID : workerId, project: project});
                    }
                }, function(error) {
                    console.log('error ', error)
                    res.status(500).send({error: error.code});
                });

            }, function(err) {
                console.log('err ', err);
                res.status(500).send({error: err.code || 'Invalid project code'});
            });

    });



router.get('/startKiosk/:pCode',
    [filters.requiredParamHandler([])],
    function(req, res, next) {
        // generate a worker id
        var workerId = req.query.workerId;
        var projectID = req.params.pCode;
            projectDB.getSingleProjectFromCode(projectID).then(function(project) {
                req.logout();
                anonUserDB.findConsentedKioskWorker(workerId, projectID).then(function(user) {
                    console.log('user is consented kiosk worker', user);
                    if (user.id) {
                        console.log('user object ', user);
                        loginAnonKioskUser(req, user).then(function(data) {
                            res.redirect('/api/tasks/startProject/' + projectID);
                        });

                    } else {
                        console.log('user object ', user)
                        res.status(200).send({projectID: projectID, workerID : workerId});
                    }
                }, function(error) {
                    console.log('error ', error)
                    res.status(500).send({error: error.code});
                });

            }, function(err) {
                console.log('err ', err);
                res.status(500).send({error: err.code || 'Invalid project code'});
            });
        console.log('workerId ', workerId);
        //select a project list from all public projects

    });


router.get('/consentKiosk/:pCode',
    [filters.requiredParamHandler(['workerId'])],
    function(req, res, next) {
        console.log('req ',req.query);
        console.log('params ', req.query);
        projectDB.getSingleProjectFromCode(req.params.pCode).then(function(project) {
            return anonUserDB.addKioskWorker(req.query, req.params.pCode, req.query.cookie, 1);
        }).then(function(userID) {
            if (userID != null) {
                res.status(200).send({workerId: req.query.workerId});
            }
        }).catch(function(err) {
            res.status(500).send({error: err.code});
        });
    });

router.get('/consent/:pCode',
  [filters.requiredParamHandler(['workerId', 'assignmentId', 'hitId', 'submitTo'])],
  function(req, res, next) {
    var selectedProject={};
    projectDB.getSingleProjectFromCode(req.params.pCode).then(function(project) {
        selectedProject = project;
        //here check for genetic:
        if (!req.query.genetic){
            return anonUserDB.addMTurkWorker(req.query, req.params.pCode, 1, 1,0);
        } else {
            //must assign genetic sequence first and add id and log in user
            console.log("assigning genetic id");
            projectDB.getTutorialSequenceRandomGenetic(req.params.pCode).then(function (genetic_id) {
                anonUserDB.addMTurkWorker(req.query, req.params.pCode, 1, 1, genetic_id).then(function (userID) {
                    if (userID != null) {
                        //log the user here!
                        //find user then login
                        anonUserDB.findConsentedMTurkWorker(req.query.workerId, req.params.pCode,req.query.hitId).then(function(user) {
                            if (user.id) {
                                loginAnonUser(req, user).then(function (d) {
                                    res.status(200).send({project: selectedProject});
                                })
                            }
                        })
                    }
                });
            })
        }

    }).then(function(userID) {
      if (userID != null) {
        res.status(200).send({project: selectedProject});
      }
    }).catch(function(err) {
      res.status(500).send({error: err.code});
    });
  });


router.get('/awardBonusTutorial/:pCode/:hitId/:workerid',function(req,res,next) {

    var wID = req.params.workerid;
    var hit_id = req.params.hitId;
   var resHash = bcrypt.hashSync(wID + hit_id, salt);
    //get the project details
    projectDB.getSingleProjectFromCode(req.params.pCode).then(function(project) {
        //get the votes on the tutorial
        resultDB.getTutorialResults(project,resHash).then(function(votes) {
            var mistakes = 0;
            if(votes){
                //check for mistakes
                votes.forEach(function(item){
                    var ans = item.vote;
                    ans = ans.toString().replace(/"/g, "");
                    var ans2 = item.answer;
                    ans2 = ans2.toString();
                    if( ans != ans2) {
                        mistakes++;
                    }
                });
                res.status(200).send({workerid: wID, mistakes: mistakes, voted: votes.length });

            } else {
                res.status(500).send("Data not found");
            }
        }).catch(function(err) {
            console.log(err)

            res.status(500).send({error: err.code});
        });

    }).catch(function(err) {
        res.status(500).send({error: err.code});
    });
});

router.get('/awardBonusTutorialOld/:pCode/:hitId/:workerid',function(req,res,next) {

    var wID = req.params.workerid;
    var hit_id = req.params.hitId;
    var resHash = bcrypt.hashSync(wID, salt);
    //get the project details
    projectDB.getSingleProjectFromCode(req.params.pCode).then(function(project) {
        //get the votes on the tutorial
        resultDB.getTutorialResults(project,resHash).then(function(votes) {
            var mistakes = 0;
            if(votes){
                //check for mistakes
                votes.forEach(function(item){
                    var ans = item.vote;
                    ans = ans.toString().replace(/"/g, "");
                    var ans2 = item.answer;
                    ans2 = ans2.toString();
                    if( ans != ans2) {
                        mistakes++;
                    }
                });
                res.status(200).send({workerid: wID, mistakes: mistakes, voted: votes.length });

            } else {
                res.status(500).send("Data not found");
            }
        }).catch(function(err) {
            console.log(err)

            res.status(500).send({error: err.code});
        });

    }).catch(function(err) {
        res.status(500).send({error: err.code});
    });
});




function loginAnonUser(req, user) {
  return new Promise(function(resolve, error) {
    user.anonymous = 1;
    user.type='mTurk';
    delete user.id;
    delete user.projectID;
    delete user.assignmentId;
    delete user.hitId;
    delete user.siteID;
    user.id = user.workerID;
    delete user.workerId;
    //console.log(user);
    req.logIn(user, function(err) {
      if (err) {
       // console.log('in error logIn');
        return error(err);
      }
      console.log("Successful login");
      resolve(user);
    });
  });
}

function loginAnonUserNoHash(req, user) {
    return new Promise(function(resolve, error) {
        user.anonymous = 1;
        user.type='mTurk';
        delete user.id;
        delete user.projectID;
        delete user.assignmentId;
        delete user.hitId;
        delete user.siteID;
        user.id = user.workerID;
        delete user.workerId;
        //console.log(user);
        req.logIn(user, function(err) {
            if (err) {
                // console.log('in error logIn');
                return error(err);
            }
            console.log("Successful login");
            resolve(user);
        });
    });
}

function loginAnonKioskUser(req, user) {
    return new Promise(function(resolve, error) {
        user.anonymous = 1;
        delete user.id;
        delete user.projectID;
        user.id = user.workerID;
        delete user.workerId;
        user.type='kiosk';

        req.logIn(user, function(err) {
            if (err) {
                console.log('in error logIn');
                return error(err);
            }
            resolve(user);
        });
    });
}

function generateUniqueWorkerId() {
    //return new Promise(function(resolve) {
        var worker_id = randomString.generate({
            length: 12,
            charset: 'alphanumeric'
        });
    //    resolve(projectCode);
   // });
    return worker_id;
}

//http://localhost:8080/api/anon/startAnon/MdGhLYDYgvWR?workerID=fwaHQhUllf&assignmentID=g43tKBDPfs&hitID=LJ6ljgAjFC&submitTo=www.submit.com