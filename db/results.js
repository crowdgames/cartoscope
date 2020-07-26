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
     WHERE r.project_id=p.id && m.projectID=p.unique_code &&  r.response >=0 && \
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
     WHERE r.project_id=p.id && r.response >=0 && \
      d.name=r.task_id && p.unique_code='" + projectCode + "'";
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


exports.heatMapDataAllSummary = function(projectCode, datasetId) {
    var connection = db.get();
    console.log(projectCode,datasetId)
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT aa.*,pp.image_source from \
        (SELECT a.task_id, ANY_VALUE(a.x) as x, ANY_VALUE(a.y) as y, ANY_VALUE(a.project_id) as project_id, \
        ANY_VALUE(a.answer) as answer, ANY_VALUE(a.color) as color ,count(a.answer) as num_votes,ANY_VALUE(a.question) as question from \
        (SELECT DISTINCT r.task_id, d.x, d.y, \
        r.timestamp, r.user_id ,r.project_id, \
        JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].text')) as answer, \
        JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].color')) as color, \
        JSON_EXTRACT(p.template, '$.question') as question \
        FROM response as r, projects as p, dataset_" + datasetId + " as d \
        WHERE r.project_id=p.id && \
        d.name=r.task_id && p.unique_code='" + projectCode + "' and r.response >=0) as a \
        GROUP BY task_id,answer) as aa \
        LEFT JOIN projects as pp \
        on aa.project_id=pp.id ";
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


exports.heatMapDataAllMajority = function(projectCode, datasetId) {
    var connection = db.get();
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT s1.task_id, s1.x, s1.y, s1.answer, s1.color, s1.num_votes \
        FROM (SELECT a.task_id, ANY_VALUE(a.x) as x, ANY_VALUE(a.y) as y, ANY_VALUE(a.project_id) as project_id, \
        ANY_VALUE(a.answer) as answer, ANY_VALUE(a.color) as color ,count(a.answer) as num_votes from \
        (SELECT DISTINCT r.task_id, d.x, d.y, \
            r.timestamp, r.user_id ,r.project_id, \
        JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].text')) as answer, \
        JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].color')) as color, \
        JSON_EXTRACT(p.template, '$.question') as question \
        FROM response as r, projects as p, dataset_" + datasetId + " as d  \
        WHERE r.project_id=p.id &&  d.name=r.task_id && p.unique_code='" + projectCode + "') as a \
        GROUP BY task_id,answer) as s1 \
        LEFT JOIN (SELECT a.task_id, ANY_VALUE(a.x) as x, ANY_VALUE(a.y) as y, ANY_VALUE(a.project_id) as project_id, \
        ANY_VALUE(a.answer) as answer, ANY_VALUE(a.color) as color ,count(a.answer) as num_votes from \
        (SELECT DISTINCT r.task_id, d.x, d.y, r.timestamp, r.user_id ,r.project_id, \
        JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].text')) as answer, \
        JSON_EXTRACT(p.template, CONCAT('$.options[', r.response, '].color')) as color, \
        JSON_EXTRACT(p.template, '$.question') as question \
        FROM response as r, projects as p, dataset_" + datasetId + " as d  \
        WHERE r.project_id=p.id &&  r.response >=0 && d.name=r.task_id && p.unique_code='" + projectCode + "') as a \
        GROUP BY task_id,answer )  as s2 \
        ON s1.task_id = s2.task_id  AND s1.num_votes < s2.num_votes \
        WHERE s2.task_id IS NULL ";
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


exports.heatMapDataAllMarkers = function(projectId) {
    var connection = db.get();
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT center_lat, center_lon, response, \
     count(response) as cnt, CONCAT(center_lat, \"/\", center_lon) as key_item \
     FROM response \
     WHERE response <> -1  && project_id='" + projectId + "' \
     GROUP BY center_lat, center_lon,response";
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
                console.log(err)
            });
    });
};

exports.heatMapDataAllMarkersUsers = function(projectId) {
    var connection = db.get();
    return new promise(function(resolve, error) {
        var heatMapQuery = "SELECT user_id, center_lat, center_lon, response, \
      CONCAT(center_lat, \"/\", center_lon) as key_item \
     FROM response \
     WHERE response <> -1  && project_id='" + projectId + "'"
        connection.queryAsync(heatMapQuery).then(
            function(data) {

                resolve(data);
            }, function(err) {
                error(err);
                console.log(err)
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
     WHERE r.project_id=p.id &&  r.response >=0 && \
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

exports.getTutorialResults = function(project,userId) {

    var connection = db.get();
    return new promise(function(resolve, error) {

        var heatMapQuery = "select u.image_name,u.answer,u.response,u.user_id, JSON_EXTRACT(p.template, CONCAT('$.options[', u.response, '].text')) as vote \
        from projects as p, (select image_name,response,answer,user_id,project_id from  response \
        INNER JOIN tutorial ON substr(tutorial.image_name, 1, length(tutorial.image_name)-4) = response.task_id \
        where  response.user_id='" + userId + "' and response.project_id="+ project.id + " and tutorial.unique_code=\""+project.unique_code +"\" ) as u where p.id="+ project.id + " ;";

        connection.queryAsync(heatMapQuery).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });

};


exports.getProjectsVotesHIT = function(hit_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('select r.task_id,r.user_id,r.timestamp,r.response,r.response_text,u.projectID,u.hitID from ' +
            '(select task_id,project_id,user_id,timestamp,response,response_text from response) as r ' +
            'left join (select workerID, hitID,projectID from mturk_workers) as u on u.workerID=r.user_id where hitID=? ',
            [ hit_id]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });

};




exports.getSurveyVotesHIT = function(hit_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('select r.user_id,r.response,u.hitID,u.projectID from ' +
            '(select user_id,response from survey) as r ' +
            'left join (select workerID, hitID,projectID from mturk_workers) as u on u.workerID=r.user_id where hitID=? ',
            [ hit_id]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });

}


exports.getSurveyVotesTGHIT = function(hit_id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('select us.user_id,us.response,us.hitID,us.timestamp,g.unique_code_main,g.seq from \
        (select r.user_id,r.response,r.timestamp,u.hitID,u.genetic_id from \
        (select user_id,response,timestamp from tileoscope_survey) as r \
        left join (select workerID, hitID,genetic_id from mturk_workers) as u on u.workerID=r.user_id where hitID=?) as us \
        left join (select unique_code_main,seq, id from tileoscope_task_genetic_sequences) as g on us.genetic_id=g.id ',
            [ hit_id]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });

}