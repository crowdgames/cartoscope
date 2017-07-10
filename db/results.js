var db = require('../db/db');
var promise = require('bluebird');

exports.heatMapData = function(projectCode, datasetId) {
  var connection = db.get();
  return new promise(function(resolve, error) {
    var heatMapQuery = "SELECT DISTINCT r.task_id, d.x, d.y, \
     r.timestamp, m.workerid ,m.projectID,\
     JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].text')) as answer,\
     JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].color')) as color, \
     JSON_EXTRACT(p.template, '$.question') as question \
     FROM response as r, kiosk_workers as m, projects as p, dataset_" + datasetId + " as d \
     WHERE r.project_id=p.id && m.projectID=p.unique_code && \
     r.user_id=m.workerId && d.name=r.task_id && p.unique_code='" + projectCode + "'";
    connection.queryAsync(heatMapQuery).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};



exports.heatMapDataAll = function(projectCode, datasetId) {
    var connection = db.get();
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT DISTINCT r.task_id, d.x, d.y, \
     r.timestamp, r.user_id ,r.project_id,\
     JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].text')) as answer,\
     JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].color')) as color, \
     JSON_EXTRACT(p.template, '$.question') as question \
     FROM response as r, projects as p, dataset_" + datasetId + " as d \
     WHERE r.project_id=p.id && \
      d.name=r.task_id && p.unique_code='" + projectCode + "'";
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.heatMapDataAllUser = function(projectCode, datasetId,userId) {
    var connection = db.get();
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT DISTINCT r.task_id, d.x, d.y, \
     r.timestamp, r.user_id ,r.project_id,\
     JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].text')) as answer,\
     JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].color')) as color, \
     JSON_EXTRACT(p.template, '$.question') as question \
     FROM response as r, projects as p, dataset_" + datasetId + " as d \
     WHERE r.project_id=p.id && \
      d.name=r.task_id && r.user_id='" + userId + "' && p.unique_code='" + projectCode + "'";

        console.log(heatMapQuery)
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.getUserStats = function(userId) {
    var connection = db.get();
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT project_id,COUNT(*) as count FROM response where user_id= " + userId + " GROUP BY project_id;";
        connection.queryAsync(heatMapQuery).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};