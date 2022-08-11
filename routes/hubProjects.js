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
var hubProjectDB = require('../db/hubProject');

// var mmm = require('mmmagic');
// var Magic = mmm.Magic;
// var magic = new Magic(mmm.MAGIC_MIME_TYPE);

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


router.post('/add', [fupload.single('file'), filters.requireLogin, filters.requiredParamHandler(['name', 'description','short_description','url_name'])],
  function(req, res, next) {
    var body = req.body;
    var filename = 'default';
     console.log('body ', body);
    
    if (req.file) {
      filename = req.file.filename;
        // console.log('file '+ filename);

          //TODO: FIND A WAY TO CHECK THAT THE UPLOADED IMAGE IS VALID HERE
        
          fs.renameSync(req.file.path, 'profile_photos/' + filename);
          generateUniqueProjectCode().then(function(projectCode) {
            hubProjectDB.addHubProject(body.name, req.session.passport.user.id, body.description,body.short_description, filename, projectCode,body.url_name,body.external_sign_up,body.scistarter_link).then(
              function(result) {
                console.log('result '+ result);
                res.send({id: result.insertId, hub_unique_code: projectCode});
              }, function(err) {
                  console.log(err)
                res.status(500).send({error: err.code});
              });
          });
          
        
      
      
    } else {
      generateUniqueProjectCode().then(function(projectCode) {
        hubProjectDB.addHubProject(body.name, req.session.passport.user.id, body.description,body.short_description, filename, projectCode,body.url_name,body.external_sign_up,body.scistarter_link).then(
          function(result) {
            console.log(result)
            res.send({id: result.insertId, hub_unique_code: projectCode});
          }, function(err) {
                console.log(err);
                res.status(500).send({error: err.code});
          });
      });
    }
  });


router.post('/edit', [fupload.single('file'), filters.requireLogin, filters.requiredParamHandler(['name', 'description','short_description','url_name', 'hub_unique_code'])],
function(req, res, next) {
  var body = req.body;
  var filename = 'default';
  console.log('body ', body);


  var projectCode = req.body.hub_unique_code;
  //console.log(projectCode)
  
  if (req.file) {
    filename = req.file.filename;
      // console.log('file '+ filename);

       //TODO: FIND A WAY TO TEST IF IMAGE IS VALID HERE
      
        fs.renameSync(req.file.path, 'profile_photos/' + filename);
          hubProjectDB.editHubProject(body.name, body.description,body.short_description, filename, projectCode,body.url_name,body.external_sign_up,body.scistarter_link).then(
            function(result) {
              console.log('result '+ result);
              res.send({id: result.insertId, hub_unique_code: projectCode});
            }, function(err) {
                console.log(err)
              res.status(500).send({error: err.code});
            });
        
     
    
    
  } else {
      hubProjectDB.editHubProject(body.name , body.description,body.short_description, filename, projectCode,body.url_name,body.external_sign_up,body.scistarter_link).then(
        function(result) {
          console.log(result)
          res.send({id: result.insertId, hub_unique_code: projectCode});
        }, function(err) {
              console.log(err);
              res.status(500).send({error: err.code});
        });
  }
});

  router.post('/addSubprojectItems', function(req, res, next) {

    var hub_code = req.body.hub_unique_code;
    var subproject_items = req.body.subproject_items;
    var categories_items = req.body.categories_items;  

    //first delete what we have:
    hubProjectDB.addSubprojectItems(hub_code,subproject_items,categories_items).then(function(results) {

      res.status(200).send("Subproject items set successfully!")

    }, function(err) {
        console.log(err)
        res.status(400).send('Error adding subprojects to hub');
    });
});

router.post('/publish', [filters.requireLogin, filters.requiredParamHandler(['hub_unique_code']), upload.any()],
  function(req, res, next) {
    hubProjectDB.publish(req.body.hub_unique_code).then(function() {
      res.send({'status': 'done'});
    }, function(err) {
      res.status(500).send({'error': err.code});
    });
  });


  
  router.get('/getAllHubProjectsPublic', function(req, res, next) {
    var getHubProjects = hubProjectDB.getAllHubProjectsPublic();
    getHubProjects.then(function(hub) {
        if (hub.length > 0) {
            res.send(hub)
        } else {
            res.status(500).send({error: 'Public projects not found'});
        }
    }).catch(function(error) {
        res.status(500).send({error: error.code || 'Hub projects not found'});
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
