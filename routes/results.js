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
