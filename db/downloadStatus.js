/**
 * Created by kiprasad on 30/08/16.
 */
var db = require('../db/db');
var Promise = require('bluebird');

/**
 * An insert query which inserts the status of the downloading of a dataset for a project into download status table.
 * @param id id of the download
 * @param status status of download
 * @param done
 */
exports.setStatus = function(id, status, done) {
  var connection = db.get();
  connection.query('INSERT INTO downloadStatus (id,status) VALUES(?, ?) ON DUPLICATE KEY UPDATE status = ?',
    [id, status, status],
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.getStatus = function(id, done) {
  var connection = db.get();
  connection.query('SELECT status FROM downloadStatus where id = ?', [id],
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.checkUnique = function(id, done) {
  var connection = db.get();
  connection.query('SELECT * FROM downloadStatus where id = ?', [id],
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.getDataSetStatus = function(id) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    connection.query('SELECT status FROM downloadStatus where id = ?', [id],
      function(err, result) {
        if (err) {
          reject(err);
        } else {
          if (result.length > 0) {
            resolve(result[0]);
          } else {
            reject({code: 'No dataset found'});
          }
        }
      });
  });
};
