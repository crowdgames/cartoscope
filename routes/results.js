var resultDB = require('../db/results');
var projectDB = require('../db/project');
var filters = require('../constants/filters');
var express = require('express');
var router = express.Router();

module.exports = router;

router.get('/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
      var datasetId = project.dataset_id;
      resultDB.heatMapData(projectCode, datasetId).then(function(results) {
        res.send(results);
      }, function(err) {
        res.status(400).send('heatmap results could not be generated!!!');
      });
    }, function(err) {
      res.status(400).send('project not found!!!');
    })});


router.get('/all/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
        var datasetId = project.dataset_id;
        resultDB.heatMapDataAll(projectCode, datasetId).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('heatmap results could not be generated!!!');
        });
    }, function(err) {
        res.status(400).send('project not found!!!');
    })});

router.get('/all/:projectCode/:userId', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var userId = req.params.userId;
    console.log(userId)
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
        var datasetId = project.dataset_id;
        resultDB.heatMapDataAllUser(projectCode, datasetId,userId).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('results could not be generated!!!');
        });
    }, function(err) {
        res.status(400).send('project not found!!!');
    })});


router.get('/getUserStats/:userId', function(req, res, next) {
    var userId = req.params.userId;
    resultDB.getUserStats(userId).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('results could not be generated!!!');
    });
});