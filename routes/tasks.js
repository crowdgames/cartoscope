/**
 * Created by kiprasad on 03/10/16.
 */
var express = require('express');
var router = express.Router();
var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');
var filters = require('../constants/filters');
var fs = require('fs');
var passport = require('passport');
var path = require('path');
module.exports = router;
var Promise = require('bluebird');
var all = Promise.all;
var ss = require('seededshuffle');
var dsDB = require('../db/downloadStatus');

router.get('/getInfo/:code', [filters.requireLogin], function(req, res, next) {
  checkUserAllowedAccess(req.session.passport.user, req.params.code).then(function(data) {
    //console.log('In CheckUserAllowed Acess', data);
    var getProject = projectDB.getProjectFromCode(req.params.code);
    getProject.then(function(project) {
      if (project.length > 0) {
        var getDataSetSize = projectDB.getDataSetSize(project[0]['dataset_id']);
        var getProgress = projectDB.getProgress(project[0].id, req.session.passport.user);
        
        getProgress.catch(function(err) {
          res.status(500).send({error: 'Progress not found'});
          return null;
        });
        
        getDataSetSize.catch(function(err) {
          res.status(500).send({error: 'Data set not found'});
          return -1;
        });
        
        Promise.join(getProgress, getDataSetSize, function(progress, datasetSize) {
          if (progress && datasetSize > 0) {
            var data = project[0];
            data.progress = progress.progress;
            data.size = datasetSize;
            res.send(data);
          } else {
            res.status(500).send({error: 'Progress not found'});
          }
        });
      } else {
        res.status(500).send({error: 'Project not found'});
      }
    }).catch(function(error) {
      res.status(500).send({error: error.code || 'Project not found'});
    });
  }).catch(function(err) {
    if (err.code) {
      res.status(500).send({error: err.code});
    } else {
      res.status(401).send({error: 'You are not allowed to access this project'});
    }
  });
});


//get info but if no progress found, then register it (genetic tasks)
router.get('/getInfoRegister/:code', [filters.requireLogin], function(req, res, next) {
    checkUserAllowedAccess(req.session.passport.user, req.params.code).then(function(data) {
        //console.log('In CheckUserAllowed Acess', data);
        var getProject = projectDB.getProjectFromCode(req.params.code);
        var user = req.session.passport.user;
        getProject.then(function(project) {
            if (project.length > 0) {
                var getDataSetSize = projectDB.getDataSetSize(project[0]['dataset_id']);
                var getProgress = projectDB.getProgress(project[0].id, req.session.passport.user);

                getProgress.catch(function(err) {
                    res.status(500).send({error: 'Progress not found'});
                    return null;
                });

                getDataSetSize.catch(function(err) {
                    res.status(500).send({error: 'Data set not found'});
                    return -1;
                });

                Promise.join(getProgress, getDataSetSize, function(progress, datasetSize) {
                    if (progress && datasetSize > 0) {
                        var data = project[0];
                        data.progress = progress.progress;
                        data.size = datasetSize;
                        res.send(data);
                    }  else if (progress == undefined){
                        //insert progress
                        projectDB.getProjectFromCode(req.params.code).then(function(pr) {
                            projectDB.registerProgressGenetic(pr[0].id, user).then(function (reg_results) {
                                var data = pr[0];
                                data.progress = reg_results.progress;
                                data.size = datasetSize;
                                res.send(data);
                            })
                        })
                    }
                    else {
                        res.status(500).send({error: 'Progress not found'});
                    }
                });
            } else {
                res.status(500).send({error: 'Project not found'});
            }
        }).catch(function(error) {
            res.status(500).send({error: error.code || 'Project not found'});
        });
    }).catch(function(err) {
        if (err.code) {
            res.status(500).send({error: err.code});
        } else {
            res.status(401).send({error: 'You are not allowed to access this project'});
        }
    });
});


router.get("/getInfoFree/:code", function (req, res, next) {
  var getProject = projectDB.getProjectFromCode(req.params.code);
  getProject
    .then(function (project) {
      if (project.length > 0) {
        res.send(project);
      } else {
        res.status(500).send({ error: "Project not found" });
      }
    })
    .catch(function (error) {
      res.status(500).send({ error: error.code || "Project not found" });
    });
});


router.get('/getInfoFreeId/:id', function(req, res, next) {
  var getProject = projectDB.getProjectFromId(req.params.id);
  getProject.then(function(project) {
      if (project.length > 0) {
          res.send(project)
      } else {
          res.status(500).send({error: 'Project not found'});
      }
  }).catch(function(error) {
      res.status(500).send({error: error.code || 'Project not found'});
  });

});

router.get('/getInfoId/:id', [filters.requireRegularLogin], function(req, res, next) {
  var getProject = projectDB.getProjectFromId(req.params.id);
  getProject.then(function(project) {

    if (project.length > 0) {
      var getDataSetSize = projectDB.getDataSetSize(project[0]['dataset_id']);
      var getProgress = projectDB.getProgressNotNullOnEmpty(project[0].id, req.session.passport.user);
      
      getProgress.catch(function(err) {
        res.status(500).send({error: 'Progress not found'});
        return null;
      });
      
      getDataSetSize.catch(function(err) {
        res.status(500).send({error: 'Data set not found'});
        return -1;
      });
      
      Promise.join(getProgress, getDataSetSize, function(progress, datasetSize) {
        if (progress && datasetSize > 0) {
          var data = project[0];
          data.progress = progress.progress;
          data.size = datasetSize;
          res.send(data);
        } else {
          res.status(500).send({error: 'Progress not found'});
        }
      });
    } else {
      res.status(500).send({error: 'Project not found'});
    }
  }).catch(function(error) {
    res.status(500).send({error: error.code || 'Project not found'});
  });
});

function checkUserAllowedAccess(user, projectCode) {
  return new Promise(function(resolve, error) {
    if (user.anonymous) {
        //console.log('before findConsentedMTurkWorkerFromHash');
      var mturk = anonUserDB.findConsentedMTurkWorkerFromHash(user.id, projectCode).then(function(userData) {
        if (userData.consented) {
          resolve(true);
        } else {
          error(false);
        }
      });

      var kiosk = anonUserDB.findConsentedKioskWorker(user.id, projectCode).then(function(userData) {
          //console.log('before findConsentedKioskWorker');
          if (userData.consented) {
            //console.log('userData ', userData);
              resolve(true);
          } else {
              error(false);
          }});
      // },function(err) {
      //   error(err);
      // }
      //    );

       if(mturk || kiosk)
         resolve(true);
       else
         error(false);

    } else {
      resolve(true);
    }
  });
}

router.get('/gettask/:code', [filters.requireLogin], function(req, res, next) {
  projectDB.getSingleProjectFromCode(req.params.code).then(function(project) {
    // console.log("IN Task get task "+ project);
      var showInOrder = project.inorder;
      var user = req.session.passport.user;
    var dataSetId = project['dataset_id'];
    if (!dataSetId) {
      res.status(500).send({error: 'No data set found'});
    } else {
      var dataSetSize = projectDB.getDataSetSize(dataSetId);
      var getProgress = projectDB.getProgress(project.id, req.session.passport.user);
      var userID = req.session.passport.user.id;
      dataSetSize.catch(function(err) {
        res.status(500).send({error: 'Data set not found'});
        return -1;
      });
      
      getProgress.catch(function(err) {
        res.status(500).send({error: 'Progress not found'});
        return null;
      });
      
      Promise.join(dataSetSize, getProgress, function(dataSetSize, progressItem) {
        if (dataSetSize == -1 || !progressItem) {
          res.status(500).send({error: 'Data set not found or Progress not created.'});
        } else {
          processItems(dataSetId, dataSetSize, progressItem, userID, user.type,showInOrder).then(function(data) {
            if (data) {
              res.send({
                items: data,
                dataset: dataSetId,
                finished: false
              });
            } else {
              res.send({
                dataset: dataSetId,
                items: [],
                finished: true
              });
            }
          }).catch(function(err) {
            res.status(500).send({error: err.code || 'Could not retrieve items'});
          });
        }
      });
    }
  }).catch(function(err) {
    res.status(500).send({error: err.code || 'Task not found'});
  });
});

//they never end
router.get('/gettaskloop/:code', [filters.requireLogin], function(req, res, next) {
    projectDB.getSingleProjectFromCode(req.params.code).then(function(project) {
        // console.log("IN Task get task "+ project);
        var showInOrder = project.inorder;
        var user = req.session.passport.user;
        var dataSetId = project['dataset_id'];
        if (!dataSetId) {
            res.status(500).send({error: 'No data set found'});
        } else {
            var dataSetSize = projectDB.getDataSetSize(dataSetId);
            var getProgress = projectDB.getProgress(project.id, req.session.passport.user);
            var userID = req.session.passport.user.id;
            dataSetSize.catch(function(err) {
                res.status(500).send({error: 'Data set not found'});
                return -1;
            });

            getProgress.catch(function(err) {
                res.status(500).send({error: 'Progress not found'});
                return null;
            });

            Promise.join(dataSetSize, getProgress, function(dataSetSize, progressItem) {


                if (dataSetSize == -1 || !progressItem) {
                    res.status(500).send({error: 'Data set not found or Progress not created.'});
                } else {
                    var round = Math.floor(progressItem.progress/dataSetSize);


                    //if we already did the entire set, go from beginning
                    if (progressItem.progress >= dataSetSize){
                        progressItem.progress =   progressItem.progress % dataSetSize;
                        //we are using userID to shuffle, we should make a slight change to the string we use to alter the seed
                        //otherwise they get the same order the next time
                        console.log("Round:" + round)
                        userID +=  round.toString()
                    }

                    console.log("User id:" + userID.substr(userID.length - 8));



                    processItems(dataSetId, dataSetSize, progressItem, userID, user.type,showInOrder).then(function(data) {
                        if (data) {
                            res.send({
                                items: data,
                                dataset: dataSetId,
                                finished: false
                            });
                        } else {
                            res.send({
                                dataset: dataSetId,
                                items: [],
                                finished: true
                            });
                        }
                    }).catch(function(err) {
                        res.status(500).send({error: err.code || 'Could not retrieve items'});
                    });
                }
            });
        }
    }).catch(function(err) {
        res.status(500).send({error: err.code || 'Task not found'});
    });
});

//same as above but return specific limit ahead
router.get('/gettask/:code/:limit', [filters.requireLogin], function(req, res, next) {
    projectDB.getSingleProjectFromCode(req.params.code).then(function(project) {
        // console.log("IN Task get task "+ project);
        var showInOrder = project.inorder;
        var user = req.session.passport.user;
        var dataSetId = project['dataset_id'];
        if (!dataSetId) {
            res.status(500).send({error: 'No data set found'});
        } else {
            var dataSetSize = projectDB.getDataSetSize(dataSetId);
            var getProgress = projectDB.getProgress(project.id, req.session.passport.user);
            var userID = req.session.passport.user.id;
            dataSetSize.catch(function(err) {
                res.status(500).send({error: 'Data set not found'});
                return -1;
            });

            getProgress.catch(function(err) {
                res.status(500).send({error: 'Progress not found'});
                return null;
            });

            Promise.join(dataSetSize, getProgress, function(dataSetSize, progressItem) {
                if (dataSetSize == -1 || !progressItem) {
                    res.status(500).send({error: 'Data set not found or Progress not created.'});
                } else {
                    processItems(dataSetId, dataSetSize, progressItem, userID, user.type,showInOrder,req.params.limit).then(function(data) {
                        if (data) {
                            res.send({
                                items: data,
                                dataset: dataSetId,
                                finished: false
                            });
                        } else {
                            res.send({
                                dataset: dataSetId,
                                items: [],
                                finished: true
                            });
                        }
                    }).catch(function(err) {
                        res.status(500).send({error: err.code || 'Could not retrieve items'});
                    });
                }
            });
        }
    }).catch(function(err) {
        res.status(500).send({error: err.code || 'Task not found'});
    });
});



function processItems(dataSetId, dataSetSize, progressItem, userID, userType,inorder,limit) {
    //console.log('Data Set Size', dataSetSize);
    //console.log('processs data', progressItem);

    //how many to fetch
    if (limit == undefined){
        limit = 5;
    }

  return new Promise(function(resolve, reject) {
      var order = [];
      var progressD=0;
      for (var i = 1; i <= dataSetSize; i++) {
          order.push(i);
      }
      var userIDStr = userID + '';

    // if(dataSetSize <= progressItem.progress && userType == "kiosk" ){
    //     progressD=1;
    //     order = [];
    //     for (var i = 1; i <= dataSetSize; i++) {
    //         order.push(i);
    //     }
    //    // console.log(' in datasetsize equals progress ', order, dataSetSize);
    //     order = ss.shuffle(order, userIDStr.substr(userIDStr.length - 8));
    //     order = order.slice(progressD - 1, progressD + 4);
    //     //console.log('new orders'+ order);
    // } else{
    //     progressD = progressItem.progress;
    //
    //     if (!inorder) {
    //         order = ss.shuffle(order, userIDStr.substr(userIDStr.length - 8));
    //     }
    //     order = order.slice(progressD - 1, progressD + 4);
    //     console.log("Order is" ,order)
    //
    // }

      progressD = progressItem.progress;
      if (!inorder) {
          order = ss.shuffle(order, userIDStr.substr(userIDStr.length - 8));
      }
      //fetch next 5 items here:
      order = order.slice(progressD - 1, progressD + (limit-1));


   // var userIDStr = userID + '';
    //order = ss.shuffle(order, userIDStr.substr(userIDStr.length - 8));
    // console.log('order ', order);


    if (order.length > 0) {
      var promises = [];
      
      for (i in order) {
        var p = projectDB.getDataSetItem(dataSetId, order[i]).catch(function(e) {
          return [];
        });
        promises.push(p);
      }
      all(promises).then(function(values) {
        var ids = values.reduce(function(acc, value) {
          if (value.length > 0 && value[0]) {
            //console.log(value[0]);
            acc.push(value[0]);
          }
          return acc;
        }, []);
        
        if (ids.length != order.length) {
          reject(-1);
        } else {
          resolve(ids);
        }
      });
      
    } else {
      resolve(null);
    }
  });
}

router.get('/getImage/:dataset/:name', [filters.requireLogin], function(req, res, next) {
  res.setHeader('Content-Type', 'image/jpeg');
  if (fs.existsSync('dataset/' + req.params.dataset + '/' + req.params.name + '.jpg')) {
    res.sendFile(path.resolve('dataset/' + req.params.dataset + '/' + req.params.name + '.jpg'));
  } else {
    res.status(404).send();
  }
});


router.get('/getImageFree/:dataset/:name', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');
    if (fs.existsSync('dataset/' + req.params.dataset + '/' + req.params.name )) {
        res.sendFile(path.resolve('dataset/' + req.params.dataset + '/' + req.params.name ));
    } else {
        res.status(404).send();
    }
});

router.get('/getImageFreeSim/:dataset/:name', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');
    if (fs.existsSync('dataset/' + req.params.dataset + '/' + req.params.name )) {
        res.sendFile(path.resolve('dataset/' + req.params.dataset + '/' + req.params.name ));
    } else {
        //find the closest name:
        var index = req.params.name.lastIndexOf('.');
        var name_no_ext = req.params.name.slice(0, index)
        projectDB.getImageSimilar(req.params.dataset,name_no_ext).then(function(img){
            console.log(img)
            res.sendFile(path.resolve('dataset/' + req.params.dataset + '/' + img[0].name + '.jpg' ));
        }, function (err) {
            res.status(404).send('No similar image found.');
        })
    }
});

router.get('/startProject/:project', [filters.requireLogin], function(req, res, next) {
  var user = req.session.passport.user;
  var chain = req.query.chain;
  var genetic = req.query.genetic;
  var genetic_tree = req.query.tree;
  var qlearn = req.query.qlearn;
  var image_loop = req.query.image_loop;
  projectDB.getSingleProjectFromCode(req.params.project).then(checkDataSetReady).then(function(project) {
    if (user.anonymous) {
        console.log("Start project user");
        console.log(user);
      if (user.consented) {
        projectDB.findProgress(project, user.id, 1).then(function(data) {
          if ('progress' in data) {

              var partial_link = '/task.html#/?code=';
            //send genetic to task
              if (genetic || genetic_tree || qlearn){
                  partial_link = '/task.html#/genetic?code=';
              };


              //if coming from no params, fix url

              if (user.hasOwnProperty("participantID")) {

                  var red_link = partial_link + req.params.project+ '&type='+req.session.passport.user.type +
                      '&participantID=' + user.participantID + '&trialID=' + user.trialID + '&assignmentID='+ user.assignmentID +'&chain=' + chain;
              } else {
                  var red_link = partial_link + req.params.project+ '&type='+req.session.passport.user.type +
                      '&participantID=' + user.workerID + '&hitID=' + user.hitID + '&assignmentID='+ user.assignmentID +'&chain=' + chain;
              }

              if (image_loop){
                  red_link += "&image_loop=1"
              }

              if(req.query.hubUrl){ red_link += "&hubUrl=" + req.query.hubUrl}




            res.redirect(red_link);
          } else {
            res.status(500).send({error: 'No progress could be found'});
          }
        }).catch(function(err) {
          //console.log('in Error in start Project');
          res.status(500).send({error: err.code});
        });
      } else {
        res.redirect('api/anon/startAnon/' + req.params.project + '&workerID=' + user.workerID + '&hitID=' + user.hitID);
      }
    } else {
      projectDB.findProgress(project, user.id, 0).then(function(data) {
        if ('progress' in data) {
          res.redirect('/task.html#/?code=' + req.params.project);
        } else {
          res.status(500).send({error: 'No progress could be found'});
        }
      }).catch(function(err) {
        res.status(500).send({error: err.code});
      });
    }
  }).catch(function(error) {
    res.status(500).send({error: error.code || 'Project not found'});
  });
});

function checkDataSetReady(project) {
  return new Promise(function(resolve, reject) {
    var datasetID = project['dataset_id'];
    dsDB.getDataSetStatus(datasetID).then(function(data) {
      if (data.status == 4) {
        resolve(project);
      } else {
        reject({code: 'Project not yet ready'});
      }
    }).catch(function(error) {
      reject(error);
    });
  });
}

router.post('/flagimage', [filters.requireLogin, filters.requiredParamHandler(['taskID', 'projectID'])],
            function(req, res, next) {
                
    var taskID = req.body.taskID.name;
    var projectID = req.body.projectID;
    var userID = req.session.passport.user.id;
    projectDB.addFlaggedImage(userID, projectID, taskID).then(function (data) {
        console.log("flagged image" + data);
        res.send({});
    }).catch(function(err) {
        res.status(500).send({err: err.code || 'Could not submit response'});
    });
    
});

router.get('/getreponsecount', [filters.requireLogin],
        function(req, res, next) {

        var taskID = req.query.taskID;
        var projectID = req.query.projectID;
        var option = req.query.option;
        console.log("taskid "+ taskID);
        console.log("option "+ option);
        console.log("projectID "+ projectID);
        projectDB.getResponseCount(projectID, taskID, option).then(function(data) {
           res.send(data);
        }).catch(function(err) {
            res.status(500).send({err: err.code || 'Could not get response'});
        });
});


router.post('/submit', [filters.requireLogin, filters.requiredParamHandler(['taskID', 'option', 'projectID'])],
  function(req, res, next) {
    //var taskID = req.body.taskID;

    var taskID = req.body.taskID.name;

    var response = req.body.option;
    var projectID = req.body.projectID;
    var userID = req.session.passport.user.id;
    var centerLat = req.body.mapCenterLat;
    var centerLon = req.body.mapCenterLon;
    var multiple = req.body.multiple || 0;
    var response_text = req.body.option_text || 'dummy';

    //If markers task, don't increase the progress as long as the multiple flag is up
    if (multiple) {
        projectDB.addResponse(userID, projectID, taskID, response,centerLat, centerLon,response_text)
            .then(function(data) {
                // console.log('data inserted', data);
                res.send({});
            }).catch(function(err) {
            res.status(500).send({err: err.code || 'Could not submit response'});
        });
    } else {

        projectDB.addResponse(userID, projectID, taskID, response,centerLat, centerLon,response_text)
            .then(projectDB.increaseProgress(userID, projectID))
            .then(function(data) {
                // console.log('data inserted', data);
                res.send({});
            }).catch(function(err) {
            res.status(500).send({err: err.code || 'Could not submit response'});
        });
    }
  });


router.post('/updateProgress', [filters.requireLogin, filters.requiredParamHandler(['taskID', 'projectID'])],
    function(req, res, next) {
        var projectID = req.body.projectID;
        var userID = req.session.passport.user.id;

          projectDB.increaseProgress(userID, projectID)
                .then(function(data) {
                    // console.log('data inserted', data);
                    res.send({});
                }).catch(function(err) {
                res.status(500).send({err: err.code || 'Could not update progress'});
            });
    });

// See git for the old cairn submission function
router.post('/submitCairn', [filters.requireLogin, filters.requiredParamHandler(['projectID', 'message', 'progress', 'cairnType', 'timeWhenCairnShownToPlayer', 'timeCairnSubmitted', 'taskName'])], (req, res) => {
        let message                    = req.body.message;
        let progress                   = req.body.progress;
        let projectID                  = req.body.projectID;
        let hitID                      = req.body.hitID;
        let cairnType                  = req.body.cairnType;
        let timeWhenCairnShownToPlayer = req.body.timeWhenCairnShownToPlayer;
        let timeCairnSubmitted         = req.body.timeCairnSubmitted;
        let taskName                   = req.body.taskName;
        let userID                     = req.session.passport.user.id;
        console.log(message);

        projectDB.storeCairnMessage(userID, projectID, hitID, message, progress, cairnType, timeWhenCairnShownToPlayer, timeCairnSubmitted, taskName)
            .then((data) => {
                console.log("data inserted", data);
                res.send("success!");
            })
            .catch((err) => res.status(500).send({err: err.code || 'Could not submit cairn'}));
    });

router.post('/getCairns', [filters.requiredParamHandler(['projectID', 'cairnType'])], (req, res) => {
    // WARNING!! projectID is ignored. See getRandomCairnsForProject and getRecentCairnsForProject for explanation
    let numberRequested = req.body.numberRequested || 1;
    let cairnType       = req.body.cairnType;
    let projectID       = req.body.projectID; // IGNORED
    let userID          = req.session.passport.user ? req.session.passport.user.id : -1; // -1 is fine, since userID is only used to filter cairns we shouldn't return
    let random          = "random" in req.body ? req.body.random : true; // random default true
    if (random)
        projectDB.getRandomCairnsForProject(userID, projectID, cairnType, numberRequested)
            .then((data) => {console.log(data); res.send(data)})
            .catch((err) => res.status(500).send({err: err.code || 'Could not get cairns'}));
    else
        projectDB.getRecentCairnsForProject(userID, projectID, cairnType, numberRequested)
            .then((data) => {console.log(data); res.send(data)})
            .catch((err) => res.status(500).send({err: err.code || 'Could not get cairns'}));
});

// Posts a new entry on the worker_params. Takes in a workerID in request body.
router.post('/saveParams', [filters.requiredBodyParamsHandler(['workerID', 'params'])], (req, res) => {
  let { workerID, params } = req.body;

  anonUserDB.saveParams(workerID, params)
              .then((data) => res.status(200).send())
              .catch((err) => res.status(500).send({err: err.code || 'Could not save params'}))
})

// Gets a list of params for the worker. Takes in a workerID in query params
router.get('/getParams', [filters.requiredQueryParamsHandler(['workerID'])], (req, res) => {
  let { workerID } = req.query;

  anonUserDB.getParamsForWorker(workerID)
              .then((data) => res.status(200).send(data))
              .catch((err) => res.status(500).send({err: err.code || 'Could not get params'}))
})