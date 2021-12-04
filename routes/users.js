var express = require('express');
var userDB = require('../db/user');
var projectDB = require('../db/project');
var hubProjectDB = require('../db/hubProject');

var mmm = require('mmmagic');
var router = express.Router();
var multer = require('multer');
var validator = require('validator');
var fs = require('fs');
var isValidImage = require('../constants/imageMimeTypes').validMimeTypes;
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);
var path = require('path');
var filters = require('../constants/filters');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

var upload = multer({ storage: storage });

router.get('/checkid/:id', function(req, res, next) {
  if ('id' in req.params) {
    userDB.checkUserID(req.params.id, function(err, data) {
      if (err) {
        res.status(500).send({error: err.code});
      } else {
        if (data.length > 0) {
          res.send({'present': true});
        } else {
          res.send({'present': false});
        }
      }
    });
  } else {
    res.status(404).send({error: 'Missing ID'});
  }
});

router.get('/getusers/:user', filters.requireLogin, function(req, res, next) {
  if ('user' in req.params) {
    var query = req.params.user.toLowerCase();
    userDB.getUsers(query, function(err, data) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(data);
    });
  } else {
    res.status(404).send({error: 'Missing ID'});
  }
});

/**
 * Sets the path to profile pic and checks for logged in user. Transfers the profile pic file which is either based on user id or set to default picture.
 */
router.get('/getProfilePic/:id', [filters.requireLogin],
  function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');
    if (fs.existsSync('profile_photos/' + req.params.id)) {
      res.sendFile(path.resolve('profile_photos/' + req.params.id));
    } else {
      res.sendFile(path.resolve('profile_photos/default.png'));
    }
  });

router.get('/checkemail/:email', function(req, res, next) {
  if ('email' in req.params && validator.isEmail(req.params.email)) {
    userDB.checkEmail(req.params.email, function(err, data) {
      if (err) {
        res.status(500).send({error: err.code});
      } else {
        if (data.length > 0) {
          res.send({'present': true});
        } else {
          res.send({'present': false});
        }
      }
    });
  } else {
    res.status(404).send({error: 'Missing Email'});
  }
});

router.get('/', filters.requireLogin, function(req, res, next) {
  // console.log('router user', req.session.passport.user);
  if (req.session.passport.user.id) {
    console.log('id of user exists.....');
    userDB.getUser(req.session.passport.user.id, true, function(err, result) {
      console.log('No err in get User', result);
      if (!err) {
        if (result.length > 0) {
          res.setHeader('Content-Type', 'application/json');
            console.log('result ', JSON.stringify(result));
          res.send(JSON.stringify(result));

        } else {
          console.log('In Cannot find user Id')
          res.status(500).send({error: 'Cannot find User with ID=' + req.params.id});
        }
      } else {
          console.log('In error');
        res.status(500).send({error: err.code});
      }
    });
  } else {
      console.log('In Missing id');
    res.status(404).send({error: 'Missing ID'});
  }
});

/**
 * Route to add page, validate the user data and post the user details to the user table.
 */
router.post('/add', upload.any(), function(req, res, next) {
  var body = req.body;
  console.log('body info', body);

  if (!body.username || !body.password || !body.email) {
    res.status(400).send({error: 'Missing one of required parameters: username, password and email'});
    return;
  } else if (!validator.isEmail(body.email)) {
    res.status(400).send({error: 'malformed email'});
  }
  
  var filename = 'default';
  if (req.files && req.files.length > 0) {
    filename = req.files[0].filename;
      console.log('filename ', filename);

    magic.detectFile(req.files[0].path, function(err, result) {
      if (err) {
        res.status(500).send({error: 'problem with the uploaded image, please try again'});
        fs.unlink(req.files[0].path);
      }

      if (isValidImage(result)) {
        console.log('result ', result);
        fs.renameSync(req.files[0].path, 'profile_photos/' + filename);
        addToDB(body, filename, res);
      } else {
        res.status(500).send({error: 'problem with the uploaded image, please try again'});
        fs.unlink(req.files[0].path);
      }
    });
  } else {
    addToDB(body, filename, res);
  }
});

/**
 * Add the user details to the users table in the database.
 * @param body details of the user such as name, email, password
 * @param filename profile photo of the user
 * @param res response object
 */
var addToDB = function(body, filename, res) {
  console.log('body details ', body);
  userDB.addUser(body.username, body.email, body.password, body.agreeMail, body.agreeNewProject, filename, body.bio,
    function(err, id) {
      if (!err) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({'id': id}));
      } else {
        res.status(500).send({error: err.code});
      }
    });
};

router.delete('/delete/:id', function(req, res, next) {
  if ('id' in req.params) {
    userDB.deleteUser(req.params.id, function(err, rowsAffected) {
      if (!err && rowsAffected == 1) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({'id': req.params.id}));
      } else {
        if (err) {
          res.status(500).send({error: err.code});
        } else {
          res.status(500).send({error: 'Cannot find User with ID=' + req.params.id});
        }
      }
    });
  } else {
    res.status(404).send({error: 'Missing ID'});
  }
});

/**
 * A post request is made to update the details of the user wherein attributes are validated and user table is updated.
 */
router.post('/editUser', upload.any(), filters.requireLogin, function(req, res, next) {
    var body = req.body;
    console.log('body info', body);

    if (!body.username || !body.email) {
        res.status(400).send({error: 'Missing one of required parameters: username, password and email'});
        return;
    } else if (!validator.isEmail(body.email)) {
        res.status(400).send({error: 'malformed email'});
    }

    var filename = 'default';

    //filename = body.profilePic || filename;

    if (req.files && req.files.length > 0) {
        filename = req.files[0].filename;
        console.log('filename ', filename);

        magic.detectFile(req.files[0].path, function(err, result) {
            if (err) {
                res.status(500).send({error: 'problem with the uploaded image, please try again'});
                fs.unlink(req.files[0].path);
            }

            if (isValidImage(result)) {
                console.log('result ', result);
                fs.renameSync(req.files[0].path, 'profile_photos/' + filename);
                updateToDB(body, filename, res);
            } else {
                res.status(500).send({error: 'problem with the uploaded image, please try again'});
                fs.unlink(req.files[0].path);
            }
        });
    } else {
        updateToDB(body, filename, res);
    }
});

/**
 * New details of the user are updated into the users table of the database.
 * @param body details of the user such as name, email, password
 * @param filename profile pic of the user
 * @param res response object
 */
var updateToDB = function(body, filename, res) {
    console.log('body update details ', body);
    if (body.profilePic == undefined){
        filename = filename;
    }
    if(body.password === undefined){
        body.password = " ";
    }
    userDB.updateUser(body.userId, body.username, body.email, body.password, filename, body.bio,
        function(err, id) {
            if (!err) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({'id': id}));
            } else {
                res.status(500).send({error: err.code});
            }
        });
};

router.put('/resetPassword', function(req, res, next) {
  var params = req.params;
  if ('username' in params && 'email' in params) {
    
  }
});

/**
 * Route to the projects page and make a backend call to the project database for fetching the projects of a specific user.
 */
router.get('/projects', filters.requireRegularLogin, function(req, res, next) {
  var userID = req.session.passport.user.id;
  projectDB.getAllProjectsForUser(userID).then(function(data) {
    res.send(data);
  }).catch(function(err) {
    res.status(500).send({
      error: err.code || 'Couldn\'t find projects for the user'
    });
  });
});

router.get('/hubs', filters.requireRegularLogin, function(req, res, next) {
  var userID = req.session.passport.user.id;
  hubProjectDB.getAllHubProjectsForUser(userID).then(function(data) {
    res.send(data);
  }).catch(function(err) {
    res.status(500).send({
      error: err.code || 'Couldn\'t find hub projects for the user'
    });
  });
});


router.get('/getAboutInfo/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    userDB.getAboutInfo(projectCode).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('Info not found');
    });
});



router.get('/getAboutInfoCreator/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    userDB.getAboutInfoCreator(projectCode).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('Info not found');
    });
});



module.exports = router;
