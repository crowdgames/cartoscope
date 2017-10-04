var resultDB = require('../db/results');
var projectDB = require('../db/project');
var filters = require('../constants/filters');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var json2csv = require('json2csv');
var d3 = require('d3');

module.exports = router;


//Get results for project from mturk workers
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

//Get results for project from both kiosk and mturk workers
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

//Get results for project and specific user from both kiosk and mturk workers
router.get('/all/:projectCode/:userId', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var userId = req.params.userId;
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

//Get User Stats
router.get('/getUserStats/:userId', function(req, res, next) {
    var userId = req.params.userId;
    resultDB.getUserStats(userId).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('results could not be generated!!!');
    });
});

//Get results in CSV form for specific project
router.get('/csv/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
        var datasetId = project.dataset_id;
        resultDB.heatMapDataAll(projectCode, datasetId).then(function(results) {
            //Get the distinct answers of the project and prepare the fields
            var template = JSON.parse(project.template);
            var opt = template.options;
            var ans = [];
            var fields = ['image_name'];
            opt.forEach(function (item) {
                ans.push(item.text);
                fields.push(item.text);
            });
            fields.push('majority_answer');
            fields.push('question');
            fields.push('crowd_source');
            fields.push('image_source');

            var im_source = 'Not Available';
            if (project.image_source) {
                im_source = project.image_source;
            }

            //array with results:
            var csv_results =[];


            //Get file with renaming convensions from backend:
            d3.csv('http://localhost:3000/files/'+projectCode + '_renamed.csv', function(csv_data) {


                //get all the images from the dataset_id
                projectDB.getDataSetNames(datasetId).then(function(raw_im_list) {
                    //parse images
                    var im_list_r = raw_im_list[0];
                    var im_list = im_list_r.image_list;
                    var im_array = im_list.split(',');
                    //get all votes for each image
                    im_array.forEach(function(img){

                        var max_value = -1;
                        var max_name = '';
                        var o_name = img

                        //if a renaming guide exists, rename appropriately:
                        if (csv_data !=undefined) {

                           //find image
                            var rinfo = filterResponses(
                                csv_data, {renamed_value: img + '.jpg' });
                            var renamed = rinfo[0].image_name;
                            //if renaming exists, rename it
                            if (renamed) {
                                o_name = renamed;
                            }
                        }

                        //Make object for image
                        var counters = {image_name: o_name, question: template.question, crowd_source: 'Cartoscope', image_source: im_source };

                        ans.forEach(function(ans){
                            //parse the ans:
                            var p_ans = '"' + ans + '"';
                            //filter results for image and answer
                            var answer_results = filterResponses(
                                results, {task_id: img,answer:p_ans });
                            //add to object
                            counters[ans] = answer_results.length;
                            if (answer_results.length > max_value) {
                                max_value = answer_results.length;
                                max_name = ans;
                            }
                        });
                        counters.majority_answer = max_name;
                        //add to result
                        csv_results.push(counters);
                    });
                    //Array of objects to CSV
                    var csv = json2csv({ data: csv_results, fields: fields });
                    //Send back CSV file:
                    res.attachment('results_'+projectCode +'.csv');
                    res.status(200).send(csv);
                }, function(err) {
                    res.status(400).send('results could not be generated!!!');
                });

            });



        }, function(err) {
            res.status(400).send('Results could not be generated!!!');
        });
    }, function(err) {
        res.status(400).send('project not found!!!');
    })});

//Helper function to filter out from array of objects based on object criteria
function filterResponses(array, criteria) {
    return array.filter(function (obj) {
        return Object.keys(criteria).every(function (c) {
            return obj[c] == criteria[c];
        });})
}