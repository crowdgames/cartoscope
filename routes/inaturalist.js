module.exports = (() => {
  var inatDB = require('../db/inaturalist');
  var localDataset = require('../localDataset/inaturalist');
  var Utility = require('../localDataset/Utility');

  var express = require('express');
  var router = express.Router();
  var path = require('path');
  var os = require('os');

  var site = "https://www.inaturalist.org";
  var app_id = process.env.INAT_APP_ID;

  //inat specifics:
  router.get('/loginInaturalist/:sessionId', (req, res, next) => {
      var core_site = 'https://cartosco.pe';
      if(os.hostname().indexOf("local") > -1){
        core_site = 'http://localhost:8081';
      }
      var sessionID = req.params.sessionId;
      var redirect_uri = core_site + '/inat_auth';
      var  inat_login_url = site + '/oauth/authorize?client_id=' + app_id + '&redirect_uri=' +  encodeURI(redirect_uri) + '&response_type=code';
      req.session.passport.ar_session_id = sessionID;
      res.redirect(inat_login_url);
  });

  //keep track of which images we have to record
  router.post('/submitInatRecord', (req, res, next) => {
      //if one of the two missing, then error!
      var workerId = req.body.user_code;
      var sessionID = req.body.sessionId;

      //also need category and array of images:
      var category_raw = req.body.category;

      if (sessionID == undefined){
        res.status(400).send('Project code missing.');
      }
      else if (workerId == undefined){
        res.status(400).send('User code missing.');
      }
      else if (req.body.matches == undefined){
        res.status(400).send('Matches missing.');
      }
      else if (req.body.observation_ids == undefined){
        res.status(400).send('Observation ids missing.');
      }
      else if (category_raw == undefined){
        res.status(400).send('Category missing.');
      }
      else {
        //all the images with no ground truth
        var image_array = req.body.matches.split(",");

        //corresponding observation ids
        var observation_id_array = req.body.observation_ids.split(",");
        var rep_ob = [];

        for (var i = 0; i < image_array.length; i++) {
          rep_ob.push({
            'image': image_array[i],
            'category': category_raw,
            'observation_id': observation_id_array[i]
          })
        }
        inatDB.recordINatReportsAll(userId, sessionId, rep_ob).then((d) => {
          res.status(200).send('iNat images to record logged.');
        }, (err) => {
            res.status(400).send('Error logging inat images available to report.');
        })
      }
  });

  //update images we have already reported so we don't do it again
  router.post('/updateReportedRecords', (req, res, next) => {
    if (req.body.hasOwnProperty('identification_id') && req.body.hasOwnProperty('session_id') && req.body.hasOwnProperty('report_id') ){
      inatDB.updateRecordsINatReportsById(req.body).then((d) => {
        res.status(200).send('iNat images updated as reported.');
      }, (err) => {
        res.status(400).send('Error updating reported images.');
      })
    } else {
      res.status(400).send('Error updating reported images. Make sure your body has id_array and that the array is not empty.');
    }
  });


  router.get('/getAvailableImagesReport/:sessionId', (req, res, next) => {
      var sessionID = req.params.sessionId;
      inatDB.getAvailableImagesToReport(sessionID).then((data) => {
        var ret_ob = [];
        data.forEach((item) => {
          item.image_path = '/api/tasks/getImageFreeSim/' + item.dataset_id + '/' + item.image_name + '.jpg';
          item.checked = true;
          ret_ob.push(item)
        });

        res.send(ret_ob);
      }, (err) => {
        res.status(400).send('Error getting images to report.');
      })
  });

  return router;
})();
