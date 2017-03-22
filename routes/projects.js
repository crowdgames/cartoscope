/**
 * Created by kiprasad on 03/08/16.
 */
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

var email = process.env.MAILER;

module.exports = router;

router.get('/:code', [filters.requireLogin], function(req, res, next) {
  projectDB.getSingleProjectFromCode(req.params.code).then(function(project) {
    res.send(project);
  }, function(err) {
    res.status(400).send(err.code);
  });
});

router.post('/add', [upload.any(), filters.requireLogin, filters.requiredParamHandler(['name', 'description'])],
  function(req, res, next) {
    var body = req.body;
    var filename = 'default';

    if (req.files && req.files.length > 0) {
      filename = req.files[0].filename;
      magic.detectFile(req.files[0].path, function(err, result) {
        if (err) {
          res.status(500).send({error: 'problem with the uploaded image, please try again'});
          fs.unlink(req.files[0].path);
        }

        if (isValidImage(result)) {
          fs.renameSync(req.files[0].path, 'profile_photos/' + filename);
          generateUniqueProjectCode().then(function(projectCode) {
            projectDB.addProject(body.name, req.session.passport.user.id, body.description, filename, projectCode).then(
              function(result) {
                res.send({id: result.insertId, code: projectCode});
              }, function(err) {
                res.status(500).send({error: err.code});
              });
          });

        } else {
          res.status(500).send({error: 'problem with the uploaded image, please try again'});
          fs.unlink(req.files[0].path);
        }
      });

    } else {
      generateUniqueProjectCode().then(function(projectCode) {
        projectDB.addProject(body.name, req.session.passport.user.id, body.description, filename, projectCode).then(
          function(result) {
            res.send({id: result.insertId, code: projectCode});
          }, function(err) {
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
    res.status(400).send({error: error.body || 'Project couldn\'t be un-archived rite now'});
  });
});

router.post('/:id/survey', [filters.requireLogin], function(req, res, next) {
  if (req.session.passport.user.anonymous) {
    projectDB.getSingleProjectFromCode(req.params.id).then(function(project) {
        projectDB.addSurvey(req.session.passport.user.id, project.id, req.body).then(
        function(data) {
          console.log('inside function ... '+ data);
          if(req.session.passport.user.type == "mTurk"){
              anonUserDB.addHitCode(req.session.passport.user.id, req.params.id).then(function(data) {
                  res.send({hitCode: data, workerId: req.session.passport.user.id});
              }, function(err) {
                  res.status(500).send({error: err.code || 'Could not generate hit code. Please contact us'});
              });
          } else  if(req.session.passport.user.type == "kiosk"){
              //req.logout();
              res.send({heatMap: 'heatMap', workerId: req.session.passport.user.id});
          }
        },
        function(err) {
          res.status(500).send({error: err.code});
        }
      );

    }, function(err) {
      res.status(500).send({error: err.code});
    });
  } else {
    res.status(401).send({error: 'Only anonymous users can complete the survey'});
  }
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
