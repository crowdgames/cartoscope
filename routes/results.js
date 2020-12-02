var resultDB = require('../db/results');
var projectDB = require('../db/project');
var tileDB = require('../db/tileoscope');
var filters = require('../constants/filters');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var json2csv = require('json2csv');
var d3 = require('d3');
var CARTO_PORT = process.env.CARTO_PORT || '8081';
var path = require('path');
var d3 = require('d3');

module.exports = router;






//Get simple results from HIT for Cartoscope Classic
router.get('/votes/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getProjectsVotesHIT(hit_id).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('simple results could not be generated!!!');
        });
});

//Get simple results from HIT for Cartoscope Classic
router.get('/votesKiosk/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getProjectsVotesHITKiosk(hit_id).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('simple results could not be generated!!!');
    });
});


//Get simple results from HIT for Tile-o-Scope Grid
router.get('/votesTG/:hit_id', function(req, res, next) {
    
    //if one of the two missing, then error!
    var hitId = req.params.hit_id;
    //make sure there is a project
    tileDB.getTileoscopeMoves(hitId).then(function(moves) {
        res.send(moves);
    }, function(err) {
        console.log('err ', err);
        res.status(404).send('No trial found.');
    });
});


//Get survey results for HIT from Cartoscope Classic
router.get('/survey/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getSurveyVotesHIT(hit_id).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('survey results could not be generated!!!');
    });
});

//Get survey results for HIT from Cartoscope Classic
router.get('/surveyKiosk/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getSurveyVotesHITKiosk(hit_id).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('survey results could not be generated!!!');
    });
});


//Get survey results from HIT from Tile-o-Scope Grid
router.get('/surveyTG/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getSurveyVotesTGHIT(hit_id).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('survey results could not be generated!!!');
    });
});

//Get survey results from HIT from Tile-o-Scope Grid
router.get('/surveyTGRaw/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getSurveyVotesTGHITRaw(hit_id).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('survey results could not be generated!!!');
    });
});

//Get survey results for external surveys
router.get('/surveyExternal/:hit_id', function(req, res, next) {

    var hit_id = req.params.hit_id;
    resultDB.getSurveyVotesHITExternal(hit_id).then(function(results) {
        res.send(results);
    }, function(err) {
        res.status(400).send('survey results could not be generated!!!');
    });
});


//Check Expert progress
router.get('/checkExpertProgress/:hit_code', function(req, res, next) {

    var hg_ids = [55,56,57,58,59,60];

    resultDB.getExpertsWID(req.params.hit_code).then(function(wids) {
        resultDB.getHGExpertProgress(wids).then(function(results) {
            res.send(results);
        }, function(err) {
            console.log(err);
            res.status(400).send('raw HG results could not be retrieved');
        });
    }, function(err) {
        console.log(err)
        res.status(400).send('worker ids could not be fetched');
    });
});


//Get raw HG data from all projects
router.get('/landloss_progress_timeline', function(req, res, next) {

    resultDB.getLandLossVisitorsTimeline().then(function(results) {
        res.send(results);
    }, function(err) {
        console.log(err)
        res.status(400).send('Error retrieving user timeline for Land Loss projects');
    });
});


//Get raw HG data from all projects
router.get('/hg_raw_data', function(req, res, next) {

    var hg_ids = [55,56,57,58,59,60];
    var dataset_id = "0k9ceCYzyqLt1pR";

    // hg_ids =[69]
    // dataset_id = "jtUC5ek9sbokHao"

    resultDB.getRawResultsMultiplebyTextGrouped(hg_ids,dataset_id,true).then(function(results) {
        res.send(results);
    }, function(err) {
        console.log(err)
        res.status(400).send('raw HG results could not be retrieved');
    });
});

//Get raw HG data from all projects
router.get('/hg_raw_data_launch', function(req, res, next) {

    var hg_ids = [55,56,57,58,59,60];
    var dataset_id = "0k9ceCYzyqLt1pR";

    //hg_ids =[69]
    //dataset_id = "jtUC5ek9sbokHao"

    resultDB.getRawResultsMultiplebyTextGrouped(hg_ids,dataset_id,false).then(function(results) {
        res.send(results);
    }, function(err) {
        console.log(err)
        res.status(400).send('raw HG results could not be retrieved');
    });
});

//Get raw HG survey data from all projects
router.get('/hg_raw_data_survey', function(req, res, next) {

    var hg_ids = [55,56,57,58,59,60];
    // hg_ids =[69]
    // dataset_id = "jtUC5ek9sbokHao"
    resultDB.getSurveyAnswersLandLoss(hg_ids).then(function(results) {
        res.send(results);
    }, function(err) {
        console.log(err)
        res.status(400).send('raw HG results could not be retrieved');
    });
});


//Get raw HG data from all projects, ungrouped votes for analysis
router.get('/hg_raw_votes_launch', function(req, res, next) {

    var hg_ids = [55,56,57,58,59,60];

    //hg_ids =[69]
    //dataset_id = "jtUC5ek9sbokHao"

    resultDB.getLandLossRawVotes(hg_ids).then(function(results) {
        res.send(results);
    }, function(err) {
        console.log(err)
        res.status(400).send('raw HG results could not be retrieved');
    });
});

//Get raw HG data from all projects
router.get('/hg_raw_data/csv', function(req, res, next) {

    var hg_ids = [55,56,57,58,59,60];
    var dataset_id = "0k9ceCYzyqLt1pR";

    // hg_ids =[69]
    // dataset_id = "jtUC5ek9sbokHao"

    var today = new Date();
    var dd = today.getDate().toString()
    var mm = (today.getMonth() + 1).toString();  //January is 0!
    var yyyy = today.getFullYear().toString();

    var current_date = mm + '/' + dd + '/' + yyyy;
    var current_date_file = '[' +mm + '_' + dd + '_' + yyyy + ']';



    resultDB.getRawResultsMultiplebyTextGrouped(hg_ids,dataset_id).then(function(results) {

        var fields = ['image','lat','lon','majority_answer','majority_count','majority_percentage','project','image_url','date_pulled']
        var csv_results = [];


        Object.keys(results).forEach(function(image_key){

            var obj = results[image_key];
            Object.keys(obj).forEach(function(pkey){
                var item = obj[pkey];


                csv_results.push({
                    image: image_key,
                    lat: item.lat,
                    lon:item.lon,
                    majority_answer: item.majority,
                    majority_count: item.majority_count,
                    majority_percentage: item.majority_count/item.total,
                    project: pkey,
                    image_url: item.image_url,
                    date_pulled:current_date
                })
            })

        });

        var csv = json2csv({ data: csv_results, fields: fields });
        //Send back CSV file:
        res.attachment(current_date_file +'_landloss_results.csv');
        res.status(200).send(csv);


    }, function(err) {
        console.log(err)
        res.status(400).send('raw HG results could not be retrieved');
    });
});




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


//Get results for project from both kiosk and mturk workers
router.get('/all/majority/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
        var datasetId = project.dataset_id;
        resultDB.heatMapDataAllMajority(projectCode, datasetId).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('heatmap results could not be generated!!!');
        });
    }, function(err) {
        res.status(400).send('project not found!!!');
    })});


// Get aggregated results for markers
router.get('/allMarkers/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode).then(function(project) {
        var datasetId = project.dataset_id;
        console.log(project.id)
        resultDB.heatMapDataAllMarkers(project.id).then(function(results) {
            res.send(results);
        }, function(err) {
            res.status(400).send('heatmap results could not be generated!!!');
        });
    }, function(err) {
        res.status(400).send('project not found!!!');
    })});

// Get raw results for markers task
router.get('/allMarkersUsers/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode).then(function(project) {
        var datasetId = project.dataset_id;
        resultDB.heatMapDataAllMarkersUsers(project.id).then(function(results) {
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
        resultDB.heatMapDataAllSummary(projectCode, datasetId).then(function(results) {

            //Get the distinct answers of the project and prepare the fields
            var template = JSON.parse(project.template);
            var opt = template.options;
            var ans = [];
            var fields = ['image_name'];
            opt.forEach(function (item) {
                ans.push(item.text);
                fields.push(item.text);
            });
            fields.push('latitude');
            fields.push('longitude');
            fields.push('majority_answer');
            fields.push('majority_confidence');
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
            var renamed_csv_path = path.join(__dirname, 'public','/images/files/'+projectCode + '_renamed.csv');
            d3.csv('http://localhost:'+ CARTO_PORT+'/images/files/'+projectCode + '_renamed.csv', function(csv_data) {

                //get all the images from the dataset_id
                projectDB.getDataSetNames2(datasetId).then(function(raw_im_list) {
                    //parse images
                    raw_im_list.forEach(function(img_obj){

                        var img = img_obj.name;
                        //send out coordinates of image as well
                        var lat = img_obj.x;
                        var lon = img_obj.y;
                        var max_value = -1;
                        var max_name = '';
                        var o_name = img;

                        //if a renaming guide exists, rename appropriately:
                        if (fs.existsSync(renamed_csv_path)) {
                            console.log("File exists");
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
                        var counters = {
                            image_name: o_name,
                            latitude: lat,
                            longitude:lon,
                            question: template.question,
                            crowd_source: 'Cartoscope',
                            image_source: im_source
                        };
                        var tot_vot = 0;
                        ans.forEach(function(ans){
                            //parse the ans:
                            var p_ans = '"' + ans + '"';
                            //filter results for image and answer
                            var answer_results = filterResponses(
                                results, {task_id: img,answer:p_ans });
                            //add to object [search will return only one result]
                            if (answer_results.length > 0) {
                                counters[ans] = answer_results[0].num_votes;

                            } else {
                                counters[ans] = 0;
                            }
                            tot_vot = tot_vot + counters[ans];
                            if (counters[ans] > max_value) {
                                max_value = counters[ans];
                                max_name = ans;
                            }
                        });
                        counters.majority_answer = max_name;
                        if (tot_vot >0){
                            counters.majority_confidence = ((max_value/tot_vot)*100).toFixed(2).toString() + '%';
                        } else {
                            counters.majority_confidence = '0%';
                        }
                        //add to result if non zero
                        if (tot_vot > 0 ){
                            csv_results.push(counters);
                        }
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



//Get results in CSV form for specific project
router.get('/csv_heatmap/:projectCode', function(req, res, next) {
    var projectCode = req.params.projectCode;
    var project = projectDB.getSingleProjectFromCode(projectCode);
    project.then(function(project) {
        var datasetId = project.dataset_id;
        resultDB.heatMapDataAllSummary(projectCode, datasetId).then(function(results) {

            //Get the distinct answers of the project and prepare the fields
            var template = JSON.parse(project.template);
            var opt = template.options;
            var ans = [];
            var fields = ['task_id'];
            opt.forEach(function (item) {
                ans.push(item.text);
                fields.push(item.text);
            });
            fields.push('x');
            fields.push('y');
            fields.push('answer');
            fields.push('majority_confidence');
            fields.push('question');
            fields.push('crowd_source');
            fields.push('image_source');
            fields.push('color');
            fields.push('num_votes');


            var im_source = 'Not Available';
            if (project.image_source) {
                im_source = project.image_source;
            }

            //array with results:
            var csv_results =[];


            //Get file with renaming convensions from backend:
            var renamed_csv_path = path.join(__dirname, 'public','/images/files/'+projectCode + '_renamed.csv');
            d3.csv('http://localhost:'+ CARTO_PORT+'/images/files/'+projectCode + '_renamed.csv', function(csv_data) {

                //get all the images from the dataset_id
                projectDB.getDataSetNames2(datasetId).then(function(raw_im_list) {
                    //parse images
                    raw_im_list.forEach(function(img_obj){

                        var img = img_obj.name;
                        //send out coordinates of image as well
                        var lat = img_obj.x;
                        var lon = img_obj.y;
                        var max_value = -1;
                        var max_name = '';
                        var o_name = img;
                        var max_color = -1;

                        //if a renaming guide exists, rename appropriately:
                        if (fs.existsSync(renamed_csv_path)) {
                            console.log("File exists");
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
                        var counters = {
                            task_id: o_name,
                            x: lat,
                            y:lon,
                            question: template.question,
                            crowd_source: 'Cartoscope',
                            image_source: im_source
                        };
                        var tot_vot = 0;
                        ans.forEach(function(ans){
                            //parse the ans:
                            var p_ans = '"' + ans + '"';
                            var col_ans = -1;
                            //filter results for image and answer
                            var answer_results = filterResponses(
                                results, {task_id: img,answer:p_ans });
                            //add to object [search will return only one result]
                            if (answer_results.length > 0) {
                                counters[ans] = answer_results[0].num_votes;
                                col_ans = answer_results[0].color;


                            } else {
                                counters[ans] = 0;
                            }
                            tot_vot = tot_vot + counters[ans];
                            if (counters[ans] > max_value) {
                                max_value = counters[ans];
                                max_name = ans;
                                max_color = col_ans;
                            }
                        });
                        counters.answer = max_name;
                        if (tot_vot >0){
                            counters.majority_confidence = ((max_value/tot_vot)*1.0).toFixed(2);
                        } else {
                            counters.majority_confidence = 0;
                        }
                        //push color and num votes for majority as well:
                        counters.color = max_color;
                        counters.num_votes = max_value;

                        //add to result if non zero
                        if (tot_vot > 0 ){
                            csv_results.push(counters);
                        }
                    });
                    //Array of objects to CSV
                    //var csv = json2csv({ data: csv_results, fields: fields });
                    //Send back CSV file:
                    //res.attachment('results_'+projectCode +'.csv');
                    res.send(csv_results);
                }, function(err) {
                    console.log(err)
                    res.status(400).send(err);
                });
            });
        }, function(err) {
            console.log(err)
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