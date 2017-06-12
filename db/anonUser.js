/**
 * Created by kiprasad on 14/10/16.
 */
var db = require('../db/db');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var salt = process.env.SALT;
var randomString = require('randomstring');
var databaseName = process.env.DB_NAME;

exports.findMTurkWorker = function(workerID, projectID) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    
    connection.queryAsync('SELECT * from `mturk_workers` where workerID=? and projectID=?',
      [bcrypt.hashSync(workerID, salt), projectID]).then(
      function(data) {
        if (data.length == 1) {
          resolve(data[0]);
        } else {
          reject({error: 'User not found'});
        }
      }, function(err) {
        reject(err);
      });
  });
};

exports.findMTurkWorker = function(workerID, projectID) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    
    connection.queryAsync('SELECT * from `mturk_workers` where workerID=? and projectID=?',
      [bcrypt.hashSync(workerID, salt), projectID]).then(
      function(data) {
        if (data.length == 1) {
          resolve(data[0]);
        } else {
          reject({error: 'User not found'});
        }
      }, function(err) {
        reject(err);
      });
  });
};

exports.findConsentedMTurkWorker = function(workerID, projectID) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    connection.queryAsync('SELECT * from `mturk_workers` where workerID=? and projectID=? and consented=1',
      [bcrypt.hashSync(workerID, salt), projectID]).then(
      function(data) {
        if (data.length == 1) {
          resolve(data[0]);
        } else {
          resolve({});
        }
      }, function(err) {
        reject(err);
      });
  });
};

exports.findConsentedMTurkWorkerFromHash = function(workerID, projectID) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    
    connection.queryAsync('SELECT * from `mturk_workers` where `workerID`=? and `projectID`=? and `consented`=1',
      [workerID, projectID]).then(
      function(data) {
        if (data.length == 1) {
          resolve(data[0]);
        } else {
          resolve({});
        }
      }, function(err) {
        reject(err);
      });
  });
};

exports.addMTurkWorker = function(anonUser, projectID, siteID, consented) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    
    connection.queryAsync('INSERT INTO `mturk_workers` ' +
      '(`workerID`, `projectID`,`assignmentID`,`hitID`,`submitTo`,`siteID`,`consented`) VALUES ' +
      '(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `consented`=?',
      [bcrypt.hashSync(anonUser.workerId, salt), projectID, bcrypt.hashSync(anonUser.assignmentId, salt),
        bcrypt.hashSync(anonUser.hitId, salt), anonUser.submitTo, siteID, consented, consented]).then(
      function(data) {
        if (data.insertId) {
          resolve(data.insertId);
        } else if (data.affectedRows > 0) {
          resolve(0);
        } else {
          reject({code: 'Problem with insertion'});
        }
      }, function(err) {
        reject(err);
      });
  });
};

exports.addKioskWorker = function(anonUser, projectID, cookie, consented) {
    return new Promise(function(resolve, reject) {
        console.log(anonUser, projectID, cookie, consented);
        var connection = db.get();

        connection.queryAsync('INSERT INTO `kiosk_workers` ' +
            '(`workerID`, `projectID`,`cookieID`,`consented`) VALUES ' +
            '(?, ?, ?, ?) ON DUPLICATE KEY UPDATE `consented`=?',
            [anonUser.workerId, projectID, cookie, consented, consented]).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.insertId);
                } else if (data.affectedRows > 0) {
                    resolve(0);
                } else {
                    reject({code: 'Problem with insertion'});
                }
            }, function(err) {
                reject(err);
            });
    });
};

exports.findConsentedKioskWorker = function(workerID, projectID) {
    return new Promise(function(resolve, reject) {
        var connection = db.get();
        console.log('finding.. ', workerID, projectID);
        connection.queryAsync('SELECT * from `kiosk_workers` where `workerID`=? and `projectID`=? and `consented`=1',
            [workerID, projectID]).then(
            function(data) {
                if (data.length == 1) {
                    resolve(data[0]);
                } else {
                    resolve({});
                }
            }, function(err) {
                reject(err);
            });
    });
};

function generateUniqueCode() {
  return new Promise(function(resolve) {
    var projectCode = randomString.generate({
      length: 12,
      charset: 'alphanumeric'
    });
    resolve(projectCode);
  });
}
function generateHitCode(user) {
  return new Promise(function(resolve, reject) {
    if (user.id) {
      var connection = db.get();
      generateUniqueCode().then(function(code) {
        code='PAUYDVMJ';
          connection.queryAsync('UPDATE `' + databaseName + '`.`mturk_workers` SET' +
          ' `hit_code`=? WHERE `id`=?', [code, user.id]).then(
          function(data) {
            if (data.affectedRows == 1) {
              resolve(code);
            } else {
              reject({error: 'Couldn\'t find the user'});
            }
          }, function(error) {
            reject(error);
          });
      });
    } else {
      reject({error: 'User not found'});
    }
  });
}

exports.addHitCode = function(userIDHash, projectCode) {
  return new Promise(function(resolve, reject) {
    exports.findConsentedMTurkWorkerFromHash(userIDHash, projectCode).then(generateHitCode).then(function(code) {
        resolve(code);
      })
      .then(function(data) {
        resolve(data);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};
