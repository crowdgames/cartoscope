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

exports.getTutorialResults = function(pID,userId) {

    var connection = db.get();
    return new promise(function(resolve, error) {

        var heatMapQuery = "select u.image_name,u.answer,u.response,u.user_id, JSON_EXTRACT(p.template, CONCAT('$.options[', u.response, '].text')) as vote \
        from projects as p, (select image_name,response,answer,user_id,project_id from  response \
        INNER JOIN tutorial ON substr(tutorial.image_name, 1, length(tutorial.image_name)-4) = response.task_id \
        where  response.user_id='" + userId + "' and response.project_id="+ pID + ") as u where p.id="+ pID + " ;";

        connection.queryAsync(heatMapQuery).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });

}