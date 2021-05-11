var express = require('express');
var router = express.Router();
var multer = require('multer');
var validator = require('validator');
var http = require('http');
var url = require('url');
var mailer = require('../scripts/mailer');
var path = require('path');
var fs = require('fs');
var tar = require('tar-fs');
var randomString = require('randomstring');
var downloadStatus = require('../db/downloadStatus');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');
var userDB = require('../db/user');

var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);

var isValidImage = require('../constants/imageMimeTypes').validMimeTypes;
var Promise = require('bluebird');
var filters = require('../constants/filters');
var imageCompressionLib = require('../scripts/imageCompression');
var upload = multer({dest: 'uploads/'});
var bcrypt = require('bcrypt');
var salt = process.env.CARTO_SALT;




const storage = multer.diskStorage({
    destination: function (req, file, cb) {


        console.log("in storage disk")

        var path_to_store = path.join(__dirname, '../', 'uploads');
        cb(null, path_to_store)
    },
    filename: function (req, file, cb) {
        console.log(file)
        var extArray = file.originalname.split(".");
        var extension = extArray[extArray.length - 1];
        cb(null, file.originalname)
    }
})
const fupload = multer({ storage: storage });



var email = process.env.CARTO_MAILER;

module.exports = router;

router.get('/:code', [filters.requireLogin], function(req, res, next) {
  projectDB.getSingleProjectFromCode(req.params.code).then(function(project) {
    res.send(project);
  }, function(err) {
    res.status(400).send(err.code);
  });
});



router.get('/getProjects/public', function(req, res, next) {
    projectDB.getAllPublicProjects().then(function(project) {
        res.send(project);
    }, function(err) {
        res.status(400).send(err.code);
    });
});


router.get('/getProjectOwner/:userId', [filters.requireLogin], function(req, res, next) {
    var id = req.params.userId;
    userDB.getProjectOwner(id).then(function(user) {
        res.json(user);
    }, function(err) {
        res.status(400).send(err.code);
    });
});


router.get('/getProjectPoints/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
        var datasetId = project.dataset_id;
        projectDB.getDataSetPoints(datasetId).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('results could not be generated!!!');
        });
    }, function(err) {
        res.status(400).send('Project not found!!!');
    })});


router.get('/getNextProjectChain/:workerID', function(req, res, next) {
    var workerID = req.params.workerID;
    projectDB.getNextProjectChain(workerID).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('results could not be generated!!!');
        });
    });


router.post('/addTutorialItems', function(req, res, next) {

    var projectCode = req.body.unique_code;
    var tutorial_items = req.body.tutorial_items;

    //first delete what we have:
    projectDB.deleteTutorialItemsFromCode(projectCode).then(function(results) {


        Promise.each(tutorial_items, function(item, index, arrayLength) {
            //promises will be done in order
            return projectDB.insertTutorialItems(projectCode, item).then(function(result_item) {
                return result_item; // Doesn't matter
            });
        }).then(function(result) {
            // This will run after the last step is done
            res.status(200).send("Tutorial items set successfully!")
        });

    }, function(err) {
        console.log(err)
        res.status(400).send('Previous tutorial could not be deleted!!!');
    });
});


//duplicate tutorial based on other project
router.get('/duplicateTutorial/:projectCodeOld/:projectCodeNew', function(req, res, next) {
    var projectCodeOld = req.params.projectCodeOld;
    var projectCodeNew = req.params.projectCodeNew;

    //get everything from old tutorial;
    projectDB.getTutorialFromCode(projectCodeOld).then(function(tutorial_data) {

        //update unique code to make sure we are fetching things correctly:
        for (var i = 0; i < tutorial_data.length; i++) {

            tutorial_data[i].ask_user = parseInt(tutorial_data[i].ask_user);
            delete tutorial_data[i].template;
            delete tutorial_data[i].points_file;
            delete tutorial_data[i].point_selection;
            delete tutorial_data[i].unique_code;
            delete tutorial_data[i].id;
            tutorial_data[i].in_dataset = 0;
            tutorial_data[i].duplicated_entry = 1; //to make sure paths are correct when copying

            // Image annotation should link to old project
            tutorial_data[i].image_annotation = `${projectCodeOld}/${tutorial_data[i].image_annotation}`;

            //everything that was null before should be deleted!
            Object.keys(tutorial_data[i]).forEach(function(ky){
                if (tutorial_data[i][ky] == null) {
                    delete tutorial_data[i][ky]
                }
            })
        }
        //add items:
        Promise.each(tutorial_data, function(item, index, arrayLength) {
            //promises will be done in order
            return projectDB.insertTutorialItems(projectCodeNew, item).then(function(result_item) {
                return result_item; // Doesn't matter
            });
        }).then(function(result) {
            // This will run after the last step is done
            res.status(200).send("Tutorial duplicated successfully!")
        });

    }, function(err) {
        res.status(400).send('results could not be generated!!!');
    });
});



//duplicate custom survey
router.get('/duplicatesurveyItems/:projectCodeOld/:projectCodeNew', function(req, res, next) {

    //get previous survey items
    var old_project = req.params.projectCodeOld;
    var new_project = req.params.projectCodeNew;

    projectDB.getCustomSurveyItems(old_project).then(function(survey_data) {

        var survey_body = JSON.parse(survey_data.survey_form);

        projectDB.addCustomSurveyItem(new_project,survey_body).then(function(data) {
            res.status(200).send("Survey duplicated successfully!")
        }).catch(function(error) {
            console.log(error)
            res.status(400).send({error: error.body || 'Survey items could not be stored for ' + new_project});
        });

    }).catch(function(error) {
        console.log(error)
        res.status(400).send({error: error.body || 'Survey items could not be found for ' + old_project});
    });
});




router.get('/getTutorial/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    projectDB.getTutorialFromCode(projectCode).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('results could not be generated!!!');
    });
});

//Genetic Algorithm sequences
router.get('/getTutorialSequence/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    projectDB.getTutorialSequenceRandom(projectCode).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('Tutorial with sequence could not be generated!!!');
    });
});


//Genetic Algorithm sequences
router.get('/getRandomSequenceGenetic/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    projectDB.getTutorialSequenceRandomGenetic(projectCode).then(function(results) {
        res.send({random_id:results});
    }, function(err) {
        res.status(400).send('Tutorial with sequence could not be generated!!!');
    });
});



//Genetic Algorithm sequences
router.get('/getGeneticInfo/:projectCodeMain', function(req, res, next) {
    var projectCode = req.params.projectCodeMain;
    var user = req.session.passport.user;
    //Get genetic sequence for given user and projectCode:
        projectDB.getTaskGeneticInfoForUser(projectCode,user).then(function(gen_results) {
            var project_list = [];
            var supported_types = ['label','map','marker'];
            supported_types.forEach(function(item){
                var sub_code = gen_results[item + '_project'];
                if (sub_code != undefined){
                    var type_list = sub_code.split(",");
                    type_list.forEach(function(type_item){
                        project_list.push(type_item)

                    })
                }
            });
            //Get progresses for all cases
            projectDB.getProgressNotNullOnEmptyMultipleCodes(project_list,user).then(function(prog_results) {
                var total_res = {
                    genetic_info: gen_results,
                    progress_info:prog_results
                };
                res.send(total_res);
            }, function(err) {
                res.status(400).send('Progress for all items could not be found');
            });


            //res.send(results);
        }, function(err) {
            res.status(400).send('Genetic Info could not be reached');
        });

});


//Genetic Algorithm Tutorial Items
router.get('/getGeneticTutorialItems/:projectCodeMain', function(req, res, next) {
    var projectCode = req.params.projectCodeMain;
    var user = req.session.passport.user;
    //Get genetic sequence for given user and projectCode:
    projectDB.getTaskGeneticInfoForUser(projectCode,user).then(function(gen_results) {
        var project_list = [];
        var supported_types = ['label','map','marker'];
        supported_types.forEach(function(item){
            var sub_code = gen_results[item + '_project'];
            if (sub_code != undefined){
                var type_list = sub_code.split(",");
                type_list.forEach(function(type_item){
                    project_list.push(type_item)
                })
            }
        });
        //Get tutorial objects for all cases
        projectDB.getTutorialItemsMultipleCodes(project_list).then(function(tut_results) {
            res.send(tut_results);
        }, function(err) {
            res.status(400).send('Progress for all items could not be found');
        });


        //res.send(results);
    }, function(err) {
        res.status(400).send('Genetic Info could not be reached');
    });

});




//Register progress to database if not there for genetic
router.get('/registerProgressGenetic/:pCode', function(req, res, next) {
    var projectCode = req.params.pCode;
    var user = req.session.passport.user;
    //Get genetic sequence for given user and projectCode:
    projectDB.getSingleProjectFromCode(projectCode).then(function(project) {
        projectDB.registerProgressGenetic(project.id,user).then(function(reg_results) {
            res.send(reg_results);
        }, function(err) {
            res.status(400).send('Progress for project could not be initialized');
        });
    }, function(err) {
        res.status(400).send('project could not be found');
    })
});


//Generate a random tutorial sequence
router.get('/generateTutorialSequence/:projectCode/:seqsize', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var seqsize = req.params.seqsize;
    projectDB.generateTutorialSequencesRandom(projectCode,seqsize).then(function(results) {
        res.status(200).send('Sequence generated!');
    }, function(err) {
        res.status(400).send('Tutorial sequence could not be generated!!!',err);
    });
});

//Generate a random tutorial sequence
router.post('/addWorkerTutorial', function(req, res, next) {
    var projectCode = req.body.projectCode;
    var hitID = req.body.hitID;
    var sequence = req.body.sequence;
    var workerID = req.body.workerID;

    var hashWorker = bcrypt.hashSync(workerID + hitID, salt);

    projectDB.addUserTutorialSequence(hashWorker,hitID,projectCode,sequence).then(function(results) {
        res.send(results);
    }, function(err) {
        console.log(err);
        res.status(400).send('Worker could not be matched to tutorial sequence');
    });
});



//endpoint to create duplicate project based on existing code
router.get('/duplicateProject/:pCode', [ filters.requireLogin],
    function(req, res, next) {
    var unique_code = req.params.pCode;
        projectDB.getSingleProjectFromCode(unique_code).then(function(project_info) {
            //create new project here:
            generateUniqueProjectCode().then(function (unique_code_new) {
                console.log("New Code is:" + unique_code_new);
                //add all information from previous project here:

                //Must make sure the short name is unique somehow
                projectDB.duplicateShortName(project_info).then(function (new_short_name) {

                    projectDB.importSettingsFromProject(unique_code_new, project_info,new_short_name).then(function (project_code) {
                        //return all ok here and send new project code:
                        res.send({
                            new_code: project_code,
                            old_code: unique_code,
                            info: "Tutorial not set"
                        });
                    }, function (err) {
                        res.status(400).send('Duplication Failed: Project info could not be migrated ');
                    })

                }, function (err) {
                    res.status(400).send('Duplication Failed: Project short name could not be duplicated ');
                })



            }, function (err) {
                res.status(400).send('Duplication Failed: Project could not be found');
            })
        }, function (err) {
            res.status(400).send('Duplication Failed: Project could not be found')

    });
});


router.post('/add', [fupload.single('file'), filters.requireLogin, filters.requiredParamHandler(['name', 'description'])],
  function(req, res, next) {
    var body = req.body;
    var filename = 'default';
     console.log('body ', body);
    
    if (req.file) {
      filename = req.file.filename;
        // console.log('file '+ filename);

      magic.detectFile(req.file.path, function(err, result) {
        if (err) {
            console.log('result err'+ err);
            res.status(500).send({error: 'problem with the uploaded image, please try again'});
          fs.unlink(req.file.path);
        }
        
        if (isValidImage(result)) {
          fs.renameSync(req.file.path, 'profile_photos/' + filename);
          generateUniqueProjectCode().then(function(projectCode) {
            projectDB.addProject(body.name, req.session.passport.user.id, body.description, filename, projectCode,body.short_name,body.short_name_friendly, body.short_description,
                body.is_inaturalist,body.scistarter_link,body.external_sign_up).then(
              function(result) {
                console.log('result '+ result);
                res.send({id: result.insertId, code: projectCode});
              }, function(err) {
                  console.log(err)
                res.status(500).send({error: err.code});
              });
          });
          
        } else {
            console.log(err);
            res.status(500).send({error: 'problem with the uploaded image, please try again'});
          fs.unlink(req.file.path);
        }
      });
      
    } else {
      generateUniqueProjectCode().then(function(projectCode) {
        projectDB.addProject(body.name, req.session.passport.user.id, body.description, filename, projectCode,body.short_name,body.short_name_friendly,body.short_description,
            body.is_inaturalist,body.scistarter_link,body.external_sign_up).then(
          function(result) {
            res.send({id: result.insertId, code: projectCode});
          }, function(err) {
                console.log(err);
                res.status(500).send({error: err.code});
          });
      });
    }
  });

router.post('/changePrivacy',
  [filters.requireLogin, filters.requiredParamHandler(['projectID', 'privacy']), upload.any()],
  function(req, res, next) {
    projectDB.updatePrivacy(req.body.projectID, req.body.privacy).then(function(data) {
      if (data.affectedRows == 1) {
        res.send({'status': 'done'});
      } else {
        res.status(500).send({error: 'Project not found'});
      }
    }, function(err) {
      console.log(err);
      res.status(500).send({'error': err.code});
    });
  });

//update image source link
router.post('/changeImageSource',
    [filters.requireLogin, filters.requiredParamHandler(['projectID', 'image_source']), upload.any()],
    function(req, res, next) {
        projectDB.updateImageSource(req.body.projectID, req.body.image_source).then(function(data) {
            if (data.affectedRows == 1) {
                res.send({'status': 'done'});
            } else {
                res.status(500).send({error: 'Project not found'});
            }
        }, function(err) {
            console.log(err);
            res.status(500).send({'error': err.code});
        });
    });

router.post('/updateDescription',
    [filters.requireLogin, filters.requiredParamHandler(['projectID', 'description']), upload.any()],
    function(req, res, next) {
        projectDB.updateDescription(req.body.projectID, req.body.description).then(function(data) {
            if (data.affectedRows == 1) {
                res.send({'status': 'done'});
            } else {
                res.status(500).send({error: 'Project not found'});
            }
        }, function(err) {
            console.log(err);
            res.status(500).send({'error': err.code});
        });
    });


router.post('/updateDescriptionName',
    [filters.requireLogin, filters.requiredParamHandler(['projectID', 'description']), upload.any()],
    function(req, res, next) {

        var body = req.body;
        var filename = 'default';
        console.log('body ', body);

        if (req.files && req.files.length > 0) {
            filename = req.files[0].filename;
            // console.log('file '+ filename);

            magic.detectFile(req.files[0].path, function(err, result) {
                if (err) {
                    console.log('result err' + err);
                    res.status(500).send({error: 'problem with the uploaded image, please try again'});
                    fs.unlink(req.files[0].path);
                }
                if (isValidImage(result)) {
                    fs.renameSync(req.files[0].path, 'profile_photos/' + filename);

                    projectDB.updateDescriptionName(req.body.projectID, req.body.description,req.body.name,req.body.short_name, req.body.short_name_friendly,req.body.short_description,req.body.is_inaturalist,filename).then(function(data) {
                        if (data.affectedRows == 1) {
                            res.send({'status': 'done'});
                        } else {
                            res.status(500).send({error: 'Project not found'});
                        }
                    }, function(err) {
                        console.log(err);
                        res.status(500).send({'error': err.code});
                    });
                }


            })
        } else {

            projectDB.updateDescriptionName(req.body.projectID, req.body.description,req.body.name,req.body.short_name, req.body.short_name_friendly,req.body.short_description,req.body.is_inaturalist,filename).then(function(data) {
                if (data.affectedRows == 1) {
                    res.send({'status': 'done'});
                } else {
                    res.status(500).send({error: 'Project not found'});
                }
            }, function(err) {
                console.log(err);
                res.status(500).send({'error': err.code});
            });

        }




    });

router.post('/updateProjectInfoMain', [fupload.single('file'), filters.requireLogin, filters.requiredParamHandler(['name', 'description'])],
    function(req, res, next) {
        var body = req.body;
        var filename = 'default';
        console.log('body ', body);

        if (req.file ) {
            filename = req.file.filename;
            console.log(filename)
            // console.log('file '+ filename);

            magic.detectFile(req.file.path, function(err, result) {
                if (err) {
                    console.log('result err'+ err);
                    res.status(500).send({error: 'problem with the uploaded image, please try again'});
                    fs.unlink(req.file.path);
                }

                if (isValidImage(result)) {
                    fs.renameSync(req.file.path, 'profile_photos/' + filename);
                    projectDB.updateDescriptionName(req.body.projectID, req.body.description,req.body.name,req.body.short_name, req.body.short_name_friendly,
                        req.body.short_description,req.body.is_inaturalist,filename,body.scistarter_link,body.external_sign_up).
                    then(function(result) {
                        if (result.affectedRows == 1) {
                            res.send({'status': 'done'});
                        } else {
                            res.status(500).send({error: 'Project not found'});
                        }
                    })

                } else {
                    console.log(err);
                    res.status(500).send({error: 'problem with the uploaded image, please try again'});
                    fs.unlink(req.file.path);
                }
            });

        } else {
            projectDB.updateDescriptionName(req.body.projectID, req.body.description,req.body.name,req.body.short_name,
                req.body.short_name_friendly,req.body.short_description,req.body.is_inaturalist,filename,body.scistarter_link,body.external_sign_up).
            then(function(result) {
                if (result.affectedRows == 1) {
                    res.send({'status': 'done'});
                } else {
                    res.status(500).send({error: 'Project not found'});
                }                    }, function(err) {
                        console.log(err);
                        res.status(500).send({error: err.code});
                    });
        }
    });

router.post('/updateHasLocation',
    [filters.requireLogin, filters.requiredParamHandler(['projectID', 'has_location']), upload.any()],
    function(req, res, next) {
        projectDB.updateHasLocation(req.body.projectID, req.body.has_location).then(function(data) {
            if (data.affectedRows == 1) {
                res.send({'status': 'done'});
            } else {
                res.status(500).send({error: 'Project not found'});
            }
        }, function(err) {
            console.log(err);
            res.status(500).send({'error': err.code});
        });
    });




router.post('/updateARReady',
    [filters.requireLogin, filters.requiredParamHandler(['projectID', 'ar_ready']), upload.any()],
    function(req, res, next) {
        projectDB.updateARReady(req.body.projectID, req.body.ar_ready).then(function(data) {
            if (data.affectedRows == 1) {
                res.send({'status': 'done'});
            } else {
                res.status(500).send({error: 'Project not found'});
            }
        }, function(err) {
            console.log(err);
            res.status(500).send({'error': err.code});
        });
    });

router.get('/admins/:id', filters.requireLogin,
  function(req, res, next) {
    projectDB.getAdmins(req.params.id).then(function(data) {
      
      var users = [];
      
      for (var i in data) {
        users.push(userDB.getUserByID(data[i]['user_id']));
      }
      Promise.all(users).then(function(users) {
        users = users.map(function(o) {
          return o[0];
        });
        res.send(users);
      });
    }, function(err) {
      res.status(500).send({'error': err.code});
    });
  });

router.post('/admin/add', [filters.requireLogin, filters.requiredParamHandler(['projectID', 'userID']), upload.any()],
  function(req, res, next) {
    projectDB.addAdmin(req.body.projectID, req.body.userID).then(function() {
      res.send({'status': 'done'});
    }, function(err) {
      res.status(500).send({'error': err.code});
    });
  });

router.post('/admin/delete', [filters.requireLogin, filters.requiredParamHandler(['projectID', 'userID']),
    upload.any()],
  function(req, res, next) {
    projectDB.deleteAdmin(req.body.projectID, req.body.userID).then(function() {
      res.send({'status': 'done'});
    }, function(err) {
      res.status(500).send({'error': err.code});
    });
  });

router.post('/publish', [filters.requireLogin, filters.requiredParamHandler(['projectID']), upload.any()],
  function(req, res, next) {
    projectDB.publish(req.body.projectID).then(function() {
      res.send({'status': 'done'});
    }, function(err) {
      res.status(500).send({'error': err.code});
    });
  });

router.post('/updateTemplate',
  [filters.requireLogin, filters.requiredParamHandler(['projectID', 'template']), upload.any()],
  function(req, res, next) {
    var body = req.body;
    projectDB.updateTemplate(body.projectID, body.template).then(
      function(data) {
        if (data.affectedRows == 1) {
          res.send({'status': 'done'});
        } else {
          res.status(500).send({error: 'Project not found'});
        }
      }, function(err) {
        res.status(500).send({error: err.code});
      });
  });

router.post('/updateDescription',
    [filters.requireLogin, filters.requiredParamHandler(['projectID', 'template']), upload.any()],
    function(req, res, next) {
        var body = req.body;
        projectDB.updateDescription(body.projectID, body.template).then(
            function(data) {
                if (data.affectedRows == 1) {
                    res.send({'status': 'done'});
                } else {
                    res.status(500).send({error: 'Project not found'});
                }
            }, function(err) {
                res.status(500).send({error: err.code});
            });
    });



router.get('/getProjectPic/:code', function(req, res, next) {

    var getProject = projectDB.getProjectFromCode(req.params.code);
    getProject.then(function(project) {
        if (project.length > 0) {
            var cover_pic = project[0].cover_pic;
            console.log(cover_pic)
            if (fs.existsSync('profile_photos/' + cover_pic) && cover_pic != 'default') {
                res.setHeader('Content-Type', 'image/jpeg');
                res.sendFile(path.resolve('profile_photos/' +cover_pic));
            } else {
                res.status(404).send({error: 'Pic not set'});
            }
        } else {
            res.status(404).send({error: 'Project not found'});
        }
    }).catch(function(error) {
        res.status(500).send({error: error.code || 'Project pic not found'});
    });


});

function generateUniqueProjectCode() {
  return new Promise(function(resolve) {
    var projectCode = randomString.generate({
      length: 12,
      charset: 'alphanumeric'
    });
    resolve(projectCode);
  });
}

router.get('/upload/status/:id', function(req, res, next) {
  if ('id' in req.params) {
    downloadStatus.getStatus(req.params.id, function(err, result) {
      if (err) {
        res.status(500).send({error: err.code});
      } else {
        if (result.length == 1) {
          res.send(result[0]);
        } else {
          res.status(404).send({error: 'Not found'});
        }
      }
      
    });
  } else {
    res.status(400).send({error: 'ID missing'});
  }
});

router.get('/:id/archive', function(req, res, next) {
  projectDB.setArchived(req.params.id).then(function(data) {
    res.status(200).send({
      result: 'ok'
    });
  }).catch(function(error) {
    res.status(400).send({error: error.body || 'Project couldn\'t be archived rite now'});
  });
});

router.get('/:id/unarchive', function(req, res, next) {
  projectDB.setUnArchived(req.params.id).then(function(data) {
    res.status(200).send({
      result: 'ok'
    });
  }).catch(function(error) {
    res.status(400).send({error: error.body || 'Project couldn\'t be un-archived right now'});
  });
});

router.get('/ngsLocations/:code', function(req, res, next) {

    var loc_links = [];

    projectDB.getProjectFromCode(req.params.code).then(function(p_data){
        projectDB.getDataSetNames2(p_data[0].dataset_id).then(function(locs){
            locs.forEach(function(obj) {
                    loc_links.push(p_data[0].image_source + "#" + p_data[0].ngs_zoom + '/' + obj.x + '/' + obj.y);
                });
            res.send(loc_links)
        })
    }).catch(function(error) {
        res.status(400).send({error: error.body || 'Project couldn\'t be fetched'});
    });
});




//
// //fix for issues with codes!
// router.post('/:id/survey', [filters.requireLogin], function(req, res, next) {
//   if (req.session.passport.user.anonymous) {
//     projectDB.getSingleProjectFromCode(req.params.id).then(function(project) {
//         projectDB.addSurvey(req.session.passport.user.id, project.id, req.body).then(
//         function(data) {
//           console.log('inside function ... '+ data);
//           if(req.session.passport.user.type == "mTurk"){
//               anonUserDB.addHitCode(req.session.passport.user.id, req.params.id).then(function(data) {
//                   res.send({hitCode: data, workerId: req.session.passport.user.id});
//               }, function(err) {
//                   res.status(500).send({error: err.code || 'Could not generate hit code. Please contact us'});
//               });
//           } else  if(req.session.passport.user.type == "kiosk"){
//               //req.logout();
//               res.send({heatMap: 'heatMap', workerId: req.session.passport.user.id});
//           }
//         },
//         function(err) {
//           res.status(500).send({error: err.code});
//         }
//       );
//
//     }, function(err) {
//       console.log(err)
//       res.status(500).send({error: err.code});
//     });
//   } else {
//     res.status(401).send({error: 'Only anonymous users can complete the survey'});
//   }
// });


//get survey items from backend
router.get('/surveyItems/:unique_code', function(req, res, next) {

    projectDB.getCustomSurveyItems(req.params.unique_code).then(function(data) {
        res.send(data)
    }).catch(function(error) {
        res.status(400).send({error: error.body || 'Survey items could not be found for ' + req.params.uniqueCode});
    });
});


//add survey items to backend
router.post('/addsurveyItems/', function(req, res, next) {


    console.log(req.body);
    var survey_body = req.body.survey;
    var unique_code = req.body.unique_code;

    projectDB.addCustomSurveyItem(unique_code,survey_body).then(function(data) {
        res.send(data)
    }).catch(function(error) {
        console.log(error)
        res.status(400).send({error: error.body || 'Survey items could not be stored for ' + unique_code});
    });
});

//add survey items to backend
router.post('/createSurvey', function(req, res, next) {


    var survey_body = req.body.survey;
    var unique_code = req.body.unique_code;
    var survey_type = req.body.survey_type;


    projectDB.setSurveyType(unique_code,survey_type).then(function(data) {

        if (survey_type == "CUSTOM"){

            //add the items as well
            projectDB.addCustomSurveyItem(unique_code,survey_body).then(function(data) {
                res.status(200).send( ' Custom survey set for: ' + unique_code);
            }).catch(function(error) {
                console.log(error)
                res.status(400).send({error: error.body || 'Survey items could not be stored for ' + unique_code});
            });

        } else {
            res.status(200).send( 'Survey type set to ' + survey_type + 'for: ' + unique_code);
        }


    }).catch(function(error) {
        console.log(error)
        res.status(400).send({error: error.body || 'Survey type could not be set for ' + unique_code});
    });


});

//add survey items to backend
router.post('/addsurveyItemsMultiple/', function(req, res, next) {


    var survey_body = req.body.survey;
    var unique_codes = req.body.unique_codes;
    var pArr = [];

    unique_codes.forEach(function(uc){

        console.log(uc)

        var p = projectDB.addCustomSurveyItem(uc,survey_body);
        //catch and print error but do not cause problem
        p.catch(function (err) {
            console.log("OH NO: " + uc);
            console.log(err)
        });
        pArr.push(p);

    });

    Promise.all(pArr).then(function (data) {
        res.status(200).send("Success! Added survey for unique_codes" + unique_codes.join(','))

    }).catch(function (err) {
        console.log(err)
        console.log("Error adding survey items");
        res.status(400).send({error: error.body || 'Survey items could not be stored for ' + unique_code});


    });



});



//fix for issues with codes!
router.post('/:id/survey', [filters.requireLogin], function(req, res, next) {


    if (req.session.passport.user.anonymous) {
        projectDB.getSingleProjectFromCode(req.params.id).then(function(project) {
            projectDB.addSurvey(req.session.passport.user.id, project.id, req.body,req.body.trialId).then(
                function(data) {
                    console.log('inside function ... '+ data);
                    if(req.session.passport.user.type == "mTurk"){

                        //if participant id, send participant id as hit code, else from env
                        var hitCode = process.env.hitCode;
                        if (req.session.passport.user.hasOwnProperty("participantID")){
                            hitCode = req.session.passport.user.participantID;
                        }

                        res.send({hitCode: hitCode, workerId: req.session.passport.user.id});


                    } else  if(req.session.passport.user.type == "kiosk"){
                        //req.logout();
                        res.send({heatMap: 'heatMap', workerId: req.session.passport.user.id});
                    }
                },
                function(err) {
                    console.log(err)
                    //if for any reason there is an issue adding the survey text, still send hit code
                    //if participant id, send participant id as hit code, else from env
                    var hitCode = process.env.hitCode;
                    if (req.session.passport.user.hasOwnProperty("participantID")){
                        hitCode = req.session.passport.user.participantID;
                    }
                    res.send({hitCode: hitCode, workerId: req.session.passport.user.id});

                }
            );

        }, function(err) {
            console.log(err)
            res.status(500).send({error: err.code});
        });
    } else {
        res.status(401).send({error: 'Only anonymous users can complete the survey'});
    }
});

//store external survey responses
router.post('/surveyExternal' , function(req, res, next) {

            //generate a random user string
            var random_worker_id = generateUniqueWorkerId();

            projectDB.addSurvey(random_worker_id, 0, req.body,req.body.trialId).then(
                function(data) {
                    console.log('inside function ... '+ data);
                    res.send({external_survey: 1, workerId: random_worker_id});

                },
                function(err) {
                    console.log(err)
                    res.status(500).send({
                        error: err
                    })
                });
});


//storing to survey tileoscope
router.post('/surveyTileoscope', function(req, res, next) {

    console.log(req.body);

    var workerIdB = req.body.workerId || req.body.participantId;
    var hitId = req.body.hitId || req.body.trialId;

    //if we have a bonus, there will be a clash with original worker id, let's break that up:
    var worker_split = workerIdB.split("-");
    var bonus = worker_split.pop();
    var workerId = worker_split.join("-");
    var data_surv = req.body;
    data_surv.bonus = bonus;

    var worker_hashed = bcrypt.hashSync(workerId + hitId, salt);

    projectDB.addSurveyTileoscope(worker_hashed, hitId, data_surv).then(function(data) {
        console.log('inside function ... '+ data);

            //if participant id, send participant id as hit code, else from env
            var hitCode = process.env.hitCode;
            if (req.body.hasOwnProperty("participantId")){
                hitCode = req.body.participantId;
            }
            res.send({hitCode: hitCode, workerId: workerId});
            },
                function(err) {
                    console.log("Could not store survey response for:" + workerId);
                    console.log(err);
                    //if for any reason there is an issue adding the survey text, still send hit code
                    //if participant id, send participant id as hit code, else from env
                    //if participant id, send participant id as hit code, else from env
                    var hitCode = process.env.hitCode;
                    if (req.body.hasOwnProperty("participantId")){
                        hitCode = req.body.participantId;
                    }
                    res.send({hitCode: hitCode, workerId: workerId});

                }
            );



});

router.post('/upload', [filters.requireLogin, filters.requiredParamHandler(['file', 'projectID'])],
  function(req, res, next) {
    var body = req.body;
    // if('name' in body && 'desc' in body)
    if (validator.isURL(body.file)) {
      var parsedURl = url.parse(body.file);
      var options = {
        host: parsedURl.hostname,
        port: parsedURl.port,
        path: parsedURl.path,
        method: 'head'
      };
      
      assignDownloadID(function(downloadID) {
        
        var rq = http.request(options, function(rr) {
          var contentType = rr.headers['content-type'];
          if (rr.statusCode != 200) {
            res.status(500).send('{error:\'The location specified does not exist\'}');
            return;
          }
          if (contentType && contentType.search('application/zip') != -1 ||
            contentType.search('application/x-tar') != -1) {
            res.send({
              uniqueCode: downloadID
            });
            // status queued
            downloadStatus.setStatus(downloadID, 0, function(err, res) {
            });
            
            download(body.file, downloadID, req.body.projectID);
            
          } else {
            res.status(500).send({
              error: 'Not a zip file'
            });
          }
        });
        rq.end();
      });
    } else {
      res.status(500).send({
        error: 'Not a valid url'
      });
    }
  });



function assignDownloadID(done) {
  var downloadID = randomString.generate({
    length: 15,
    charset: 'alphanumeric'
  });
  downloadStatus.checkUnique(downloadID, function(err, res) {
    if (res.length > 0) {
      assignDownloadID(done);
    } else {
      done(downloadID);
    }
  });
}

function download(loc, downloadID, projectID) {
  // Status starting Download
  projectDB.addDataSetID(projectID, downloadID).then(function() {
    downloadStatus.setStatus(downloadID, 1, function(err, res) {
      
    });
    
    var downloadDir = 'temp/';
    var wget = 'wget ' + '-O ' + downloadDir + downloadID + ' ' + loc;
    
    exec(wget, {maxBuffer: 1024 * 10000000}, function(err) {
      
      if (err) {
        mailer.mailer(email, 'done', '<b> Error downloading file </b>');
        // status error with file
        downloadStatus.setStatus(downloadID, -1, function(err, res) {
        });
      } else {
        // status downloaded
        downloadStatus.setStatus(downloadID, 2, function(err, res) {
        });
        var filename = url.parse(loc).pathname;
        var parsedFilename = path.parse(filename);
        
        var type = parsedFilename.ext;
        
        var dirName = 'dataset/' + downloadID;
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName);
        }
        
        if (type == '.gz' || type == '.tar') {
          console.log('TAR FILE');
          
          var tarFile = 'temp/' + downloadID;
          
          // status started unzipping
          downloadStatus.setStatus(downloadID, 3, function(err, res) {
          });
          
          var untar = spawn('tar', ['-xvf', tarFile, '-C', dirName + '/.']);
          
          untar.stdout.on('data', function(data) {
          });
          
          untar.on('close', function(code) {
            if (code == 0) {
              readDataSetFiles(dirName, downloadID).then(imageCompressionLib.processData).then(function(data) {
                projectDB.createDataSetTable(downloadID).then(function(d) {
                  var pArr = [];
                  for (var i in data) {
                    var name = i;
                    var x = data[i].x;
                    var y = data[i].y;
                    var p = projectDB.createDataSetItem(downloadID, name, x, y);
                    p.catch(function(err) {
                      return null;
                    });
                    pArr.push(p);
                  }
                  
                  Promise.all(pArr).then(function(data) {
                      mailer.mailer(email, 'done', '<b> Done downloading file ' + filename + ' </b>');
                    downloadStatus.setStatus(downloadID, 4, function(err, res) {
                    });
                  });
                  
                });
              }).catch(function(err) {
                  mailer.mailer(email, 'done', '<b> Error downloading file ' + filename + ' </b>');
                downloadStatus.setStatus(downloadID, 4, function(err, res) {
                });
              });
            }
          });
          
        } else if (type == '.zip') {
          console.log('ZIP FILE');
        }
      }
    });
  });
}



function readDataSetFiles(dirName, dataSetID) {
  var p = new Promise(function(resolve, error) {
    fs.readdir(dirName, function(err, items) {
      if (!err) {
        this.dirName = dirName;
        this.dataSetID = dataSetID;
        resolve(items);
      } else {
        error(err);
      }
    });
  });
  p.bind({});
  return p;
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
