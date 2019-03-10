var db = require('../db/db');
var Promise = require('bluebird');
var databaseName = process.env.CARTO_DB_NAME;


//DB functions for Tileoscope and Tileoscope AR games


exports.addResponseTileoscope = function(userId, projectId, task_list, response) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var values_list = "";
        //for every item in the task list, make an item to add:
        for (var i = 0; i < task_list.length; i++) {

            //make sure we don't enter empty image
            if (task_list[i] != ""){
                var task = "\"" + task_list[i] + "\"";
                var vl = [userId,projectId,task,response,1]
                values_list += "(" + vl.toString() + "),"
            }


        }
        //remove last , from values_list
        values_list = values_list.slice(0, -1);

        connection.queryAsync('INSERT INTO response (user_id, project_id,task_id,response,site_id) VALUES ' + values_list).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.affectedRows);
                } else {
                    error({code: 'Problem with insert'});
                }
            }, function(err) {
                error(err);
            });
    });
};



//get the active genetic tree for the given main code
exports.getCreatedSequenceTileoscope = function(id) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * from tileoscope_task_genetic_sequences where id=?  ', [id])
            .then(
                function(data) {
                    resolve(data);
                }, function(err) {
                    error(err);
                });
    });
};



//get the active genetic tree for the given main code
exports.pickSequenceFeaturedTileoscope = function() {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT id as genetic_id,seq from tileoscope_task_genetic_sequences where method="featured" ORDER BY RAND() LIMIT 1 ')
            .then(
                function(data) {
                    resolve(data[0]);
                }, function(err) {
                    error(err);
                });
    });
};