/**
 * Created by kiprasad on 14/10/16.
 */
var db = require('../db/db');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var salt = process.env.CARTO_SALT;
var randomString = require('randomstring');
var databaseName = process.env.CARTO_DB_NAME;
var hitCode = process.env.hitCode;

var mailCentralUSER = process.env.CARTO_MAILER || "";
var mailCentralPWD = process.env.CARTO_MAILER_PWD || "";


/* Mail notifications  */
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: mailCentralUSER.toString(),
        pass: mailCentralPWD.toString()
    }
});


//Send email Notification
exports.sendEmailNotification = function(to, subject, message) {

    return new Promise(function(resolve, reject) {

        var mailOptions = {
            from: mailCentralUSER,
            to: to,
            subject: subject,
            text: message,
            html: message
        };
        transport.sendMail(mailOptions, function (error, response) {
            transport.close();

            if (error) {
                reject(error);
            } else {
                resolve(response)
            }

        })
    })
};



exports.findMTurkWorker = function(workerID, projectID,hitID) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();

    connection.queryAsync('SELECT * from `mturk_workers` where workerID=? and projectID=?',
      [bcrypt.hashSync(workerID + hitID, salt), projectID]).then(
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

exports.findConsentedMTurkWorker = function(workerID, projectID,hitId) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    connection.queryAsync('SELECT * from `mturk_workers` where workerID=? and hitId=? and projectID=? and consented=1',
      [bcrypt.hashSync(workerID+hitId, salt),hitId, projectID]).then(
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

exports.addMTurkWorker = function(anonUser, projectID, siteID, consented,genetic_id) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();

    //cover both external links (no params) and mturk with params
    var workerId = anonUser.workerId || anonUser.participantId;
    var hitId =  anonUser.hitId || anonUser.trialId;
    var assignmentId = anonUser.assignmentId || anonUser.participantId;
    var submitTo = anonUser.submitTo || "www.mturk.com";

    console.log(workerId);
    console.log(hitId);

    connection.queryAsync('INSERT INTO `mturk_workers` ' +
      '(`workerID`, `projectID`,`assignmentID`,`hitID`,`submitTo`,`siteID`,`consented`,`genetic_id`) VALUES ' +
      '(?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `consented`=?',
      [bcrypt.hashSync(workerId + hitId, salt), projectID, assignmentId,
          hitId, submitTo, siteID, consented, genetic_id, consented]).then(
      function(data) {
        if (data.insertId) {
          resolve(data.insertId);
        } else if (data.affectedRows > 0) {
            resolve(0);
        } else {
          reject('Problem with insertion');
        }
      }, function(err) {
        reject(err);
      });
  });
};


//update worker if already exists to new genetic_id
exports.addMTurkWorkerUpdateSequence = function(anonUser, projectID, siteID, consented,genetic_id) {
    return new Promise(function(resolve, reject) {
        var connection = db.get();

        //cover both external links (no params) and mturk with params
        var workerId = anonUser.workerId || anonUser.participantId;
        var hitId =  anonUser.hitId || anonUser.trialId;
        var assignmentId = anonUser.assignmentId || anonUser.participantId;
        var submitTo = anonUser.submitTo || "www.mturk.com";

        console.log(workerId);
        console.log(hitId);

        connection.queryAsync('INSERT INTO `mturk_workers` ' +
            '(`workerID`, `projectID`,`assignmentID`,`hitID`,`submitTo`,`siteID`,`consented`,`genetic_id`) VALUES ' +
            '(?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `consented`=?, `genetic_id`=?',
            [bcrypt.hashSync(workerId + hitId, salt), projectID, assignmentId,
                hitId, submitTo, siteID, consented, genetic_id, consented,genetic_id]).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.insertId);
                } else if (data.affectedRows > 0) {
                    resolve(0);
                } else {
                    reject('Problem with insertion');
                }
            }, function(err) {
                reject(err);
            });
    });
};


exports.addMTurkWorkerNoHash = function(anonUser, projectID, siteID, consented) {
    return new Promise(function(resolve, reject) {
        var connection = db.get();

        connection.queryAsync('INSERT INTO `mturk_workers` ' +
            '(`workerID`, `projectID`,`assignmentID`,`hitID`,`submitTo`,`siteID`,`consented`) VALUES ' +
            '(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `consented`=?',
            [anonUser.workerId, projectID, anonUser.assignmentId,
                anonUser.hitId, anonUser.submitTo, siteID, consented, consented]).then(
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

exports.addKioskWorker = function(anonUser, projectID, cookie, consented,hitID) {
    return new Promise(function(resolve, reject) {
        console.log(anonUser, projectID, cookie, consented);
        var connection = db.get();

        connection.queryAsync('INSERT INTO `kiosk_workers` ' +
            '(`workerID`, `projectID`,`cookieID`,`consented`, `hitID`) VALUES ' +
            '(?, ?, ?, ?,?) ON DUPLICATE KEY UPDATE `consented`=?',
            [anonUser.workerId, projectID, cookie, consented, hitID, consented]).then(
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

//find user by cookie
exports.findConsentedKioskWorkerbyCookie = function(cookieID, projectID) {
    return new Promise(function(resolve, reject) {
        var connection = db.get();
        console.log('finding.. ', workerID, projectID);
        connection.queryAsync('SELECT * from `kiosk_workers` where `cookieID`=? and `projectID`=? and `consented`=1',
            [cookieID, projectID]).then(
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

//count how many workers we have so far
exports.countWorkersPerHIT = function(hitID){
    return new Promise(function(resolve, reject) {
        var connection = db.get();
        connection.queryAsync('select hitId,count(*) as num_workers from mturk_workers GROUP BY hitId having hitId=?',
            [hitID]).then(
            function(data) {

                console.log(data[0])
                resolve(data[0].num_workers);
            }, function(err) {
                reject(err);
            });
    });
}


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
      generateUniqueCode().then(function(dcode) {
          console.log("Hitcode",hitCode);
        var code=hitCode;
          connection.queryAsync('UPDATE `' + databaseName + '`.`mturk_workers` SET' +
          ' `hit_code`=? WHERE `id`=?', [code, user.id]).then(
          function(data) {
            if (data.affectedRows == 1) {
              resolve(code);
            } else {
              reject({error: 'Couldn\'t find the user'});
            }
          }, function(error) {
              console.log("stuck here")
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

/**
 * Saves the parameters that the user with `workerID` used to sign on for tasks
 * after converting them into a JSON string to the `workers_params` table. 
 */
exports.saveParams = (workerID, params) => {
  return new Promise((resolve, reject) => {

    // reject the request if the worker id is not alphanumeric or if params is not a JS object
    if (!workerID.match(/^[a-zA-Z0-9]+$/) || typeof params !== "object") {
      reject(new Error("Invalid arguments."))
    }

    let connection = db.get();

    let jsonifiedParams = JSON.stringify(params);
    
    // TODO: Introduce some kind of restrictions to avoid multiple entries for the same workerID.
    // Make workerID a secondary key depending on some primary key?
    
    let query = `INSERT INTO worker_params (workerID, params) VALUES (?, ?)`

    connection.queryAsync(query, [workerID, jsonifiedParams])
                .then((data) => resolve(data),
                      (err) => {
                        console.log(err)
                        reject(err)
                      });
                })
}

/**
 * @param {string} workerID workerID for the participant 
 * @returns {[{params: object}]} a promise with data that reolves into a list of params for that worker.
 */
exports.getParamsForWorker = (workerID) => {
  return new Promise((resolve, reject) => {

    // reject the request if the worker id is not alphanumeric
    if (!workerID.match(/^[a-zA-Z0-9]+$/)) {
      reject(new Error("Invalid arguments."))
    }

    let connection = db.get();

    let query = `SELECT * FROM worker_params WHERE workerID=?`

    connection.queryAsync(query, workerID)
                .then((data) => {
                  let paramsList = data.map((entry) => ({
                    params: JSON.parse(entry.params)
                  }))
                  resolve(paramsList);
                }, 
                (err) => reject(err))
  })
}