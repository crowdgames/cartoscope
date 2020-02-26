var db = require('../db/db');
var fs = require('fs');

var Promise = require('bluebird');
var databaseName = process.env.CARTO_DB_NAME;

//other db functions
var projectDB = require('../db/project');
var anonUserDB = require('../db/anonUser');




//fetch from table and re-format
exports.getAvailableImagesToReport = function(session_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select * from inaturalist_reports where session_id=? and reported=0',[session_id]).then(
            function(data) {
                resolve(data)
            }, function(err) {
                error(err);
            });
    });
};



//insert one image with category as reported
exports.recordINatReportSingle = function(obj) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('INSERT INTO `inaturalist_reports` (user_id, session_id,image_name, category, unique_code,observation_id,taxon_id,dataset_id) VALUES(?,?,?,?,?,?,?,?) ',
            [obj.user_id, obj.sessionId,obj.image, obj.category,obj.unique_code, obj.observation_id,obj.taxon_id, obj.dataset_id ]).then(
            function(data) {
                if (data.insertId) {
                    console.log("Success");
                    resolve(data.affectedRows);
                } else {
                    error('Problem with insert');
                }
            }, function(err) {
                console.log(err);
                error(err);
            });
    });
};


//insert items that cna be reported back to iNaturalist
exports.recordINatReportsAll = function(userId, sessionId, rep_obj) {

    return new Promise(function (resolve, error) {

        //keep track of all items we have reported back
        var pArr = [];
        rep_obj.forEach(function (item) {
            var p = exports.recordINatReportSingle(item);
            p.catch(function (err) {
                // console.log(err)
            });
            pArr.push(p);
        });
        Promise.all(pArr).then(function (data) {
            //perhaps resolve with how many actually got updated
            resolve(data.length);
        }, function (err) {
            console.log(err);
            error(-1);

        });
    });

};



//insert items that cna be reported back to iNaturalist
exports.convertMatchToReports = function(session_id,user_id,unique_code,dataset_id,matches,category,obs_ids,tax_ids) {

    return new Promise(function (resolve, error) {


        var pArr = [];
        for (var i = 0; i < matches.length; i++) {
            if (matches[i] !== "" && parseInt(obs_ids[i]) !== -1 && parseInt(tax_ids[i]) !== -1) {
                var item = {
                    'user_id': user_id,
                    'sessionId': session_id,
                    'dataset_id': dataset_id,
                    'unique_code': unique_code,
                    'image' : matches[i],
                    'category': category,
                    'observation_id': obs_ids[i],
                    'taxon_id' : tax_ids[i]
                };
                var p = exports.recordINatReportSingle(item);
                p.catch(function (err) {
                    // console.log(err)
                });
                pArr.push(p);
            }

        }
        Promise.all(pArr).then(function (data) {
            //perhaps resolve with how many actually got updated
            resolve(data.length);
        }, function (err) {
            console.log(err);
            error(-1);

        });



    });

};

//update a single image as reported
exports.updateRecordsINatReportsByIds = function(id_array) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var id_array_string = id_array.join();

        connection.queryAsync('update `inaturalist_reports` set reported=1 where id IN (?)',[id_array_string]).then(
            function(data) {
                if (data.insertId) {
                    console.log("Success");
                    resolve(data.affectedRows);
                } else {
                    error('Problem with insert');
                }
            }, function(err) {
                console.log(err);
                error(err);
            });
    });
};





