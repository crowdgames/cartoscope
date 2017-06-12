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
var querystring = require('querystring');
var path = require('path');
var randomString = require('randomstring');

router.get('/startAnon/:pCode',
  [filters.requiredParamHandler(['workerId', 'assignmentId', 'hitId', 'submitTo'])],
  function(req, res, next) {
  //console.log('req.query ', req.query);
    var workerId = req.query.workerId;
    var projectID = req.params.pCode;

    projectDB.getSingleProjectFromCode(projectID).then(function(project) {
      req.logout();
      anonUserDB.findConsentedMTurkWorker(workerId, projectID).then(function(user) {
        if (user.id) {
          //console.log('user object ', user)
            loginAnonUser(req, user).then(function(data) {
            res.redirect('/api/tasks/startProject/' + req.params.pCode);
          });
          
        } else {
          res.redirect('/consentForm.html#/consent?project=' + req.params.pCode + '&' +
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
      return anonUserDB.addMTurkWorker(req.query, req.params.pCode, 1, 1);
    }).then(function(userID) {
      if (userID != null) {
        res.status(200).send({project: selectedProject});
      }
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
        var projectCode = randomString.generate({
            length: 8,
            charset: 'numeric'
        });
    //    resolve(projectCode);
   // });
    return projectCode;
}

//http://localhost:8080/api/anon/startAnon/MdGhLYDYgvWR?workerID=fwaHQhUllf&assignmentID=g43tKBDPfs&hitID=LJ6ljgAjFC&submitTo=www.submit.com