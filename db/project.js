/**
 * Created by kiprasad on 30/08/16.
 */
var db = require('../db/db');
var Promise = require('bluebird');
var databaseName = process.env.DB_NAME;

exports.isCodeUnique = function(uniqueCode, done) {
  var connection = db.get();
  connection.query('select id FROM projects WHERE unique_code=?', [uniqueCode],
    function(err, result) {
      if (err) {
        return done(err);
      }
      if (result.length > 0) {
        done(null, false);
      } else {
        done(null, true);
      }
    });
};

exports.addProject = function(name, userID, desc, picID, uniqueCode, done) {
  return new Promise(function(resolve, reject) {
    var connection = db.get();
    connection.queryAsync('INSERT INTO projects (name,creatorID,description,cover_pic,unique_code) VALUES(?,?,?,?,?)',
      [name, userID, desc, picID, uniqueCode]).then(
      function(result) {
        resolve(result);
      }).catch(function(err) {
      reject(err);
    });
  });
};

exports.setVisibility = function(projectId, accessLvl) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.query('INSERT INTO projects (name,creatorID,description,cover_pic,unique_code) VALUES(?)',
      [projectId, accessLvl],
      function(err, result) {
        if (err) {
          error(err);
        }
        resolve(result);
      });
  });
};

exports.addAdmin = function(projectId, userID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('INSERT INTO project_admins (project_id,user_id,level) VALUES(?,?,1)',
      [projectId, userID]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getAdmins = function(projectId) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    console.log(projectId);
    connection.queryAsync('SELECT * from project_admins where project_id=?', [projectId])
      .then(
        function(data) {
          resolve(data);
        }, function(err) {
          error(err);
        });
  });
};

exports.deleteAdmin = function(projectId, userID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('DELETE FROM '+databaseName+'.`project_admins` WHERE `user_id`=? and`project_id`=?',
      [userID, projectId]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.updatePrivacy = function(projectId, privacy) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('UPDATE projects SET access_type=? WHERE id=?',
      [privacy, projectId]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.updateTemplate = function(projectId, template) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('UPDATE projects SET template=? WHERE id=?',
      [template, projectId]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.updateDescription = function(projectId, description) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('UPDATE projects SET description=? WHERE id=?',
            [description, projectId]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.publish = function(projectId) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('UPDATE projects SET published=1 WHERE id=?',
      [projectId]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getProjectFromCode = function(uniqueCode) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * from projects WHERE unique_code=? and published = 1',
      [uniqueCode]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getProjectFromId = function(id) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * from projects WHERE id=?',
      [id]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getSingleProjectFromCode = function(uniqueCode) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * from projects WHERE unique_code = ? and published = 1',
      [uniqueCode]).then(
      function(data) {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          error({code: 'No project found'});
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.getSingleProjectFromCode = function(uniqueCode) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * from projects WHERE unique_code = ? and published = 1',
      [uniqueCode]).then(
      function(data) {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          error({code: 'No project found'});
        }
      }, function(err) {
        error(err);
      });
  });
};


exports.getTutorialFromCode = function(uniqueCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        console.log("I got " + uniqueCode)
        var queryString = 'SELECT * from tutorial WHERE unique_code = \'' + uniqueCode + '\'';
        console.log(queryString)
        connection.queryAsync(queryString).then(
            function(data) {
                if (data.length > 0) {
                    resolve(data);
                } else {
                    error({code: 'No project found'});
                }
            }, function(err) {
                error(err);
            });
    });
};


exports.getNumberOfContributers = function(project) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT COUNT(DISTINCT user_id) FROM '+databaseName+'.response WHERE project_id=?',
      [project.id]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getDataSetItem = function(datasetId, offset) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * FROM '+databaseName+'.dataset_' + datasetId + ' ORDER BY name ASC LIMIT 1 OFFSET ?',
      [offset - 1]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.findProgress = function(project, userId, userType) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT progress FROM '+databaseName+'.progress WHERE id=? and project_id=?',
      [userId, project.id]).then(function(progress) {
        if (progress.length == 0) {
          // NO PROGRESS, CREATE ONE
          exports.getDataSetSize(project['dataset_id']).then(function(data) {
            if (data) {
              exports.startNewProgress(userId, project.id, userType).then(
                function(newProgress) {
                  resolve({progress: 1});
                }, function(err) {
                  error(err);
                });
            } else {
              error({code: 'No data set found'});
            }
          }, function(err) {
            error(err);
          });
          
        } else {
          // @TODO find out progress
          resolve(progress[0]);
        }
      },
      function(err) {
        error(err);
      });
  });
};

exports.getDataSetSize = function(datasetId) {
  var tableName = 'dataset_' + datasetId;
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT count(*) FROM ' + tableName).then(
      function(dataSetSizeArr) {
        if (dataSetSizeArr.length > 0) {
          var dataSetSize = dataSetSizeArr[0];
          var count = dataSetSize['count(*)'];
          resolve(count);
        } else {
          error({code: 'Data set not found'});
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.getDataSetPoints = function(datasetId) {
    var tableName = 'dataset_' + datasetId;
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT * FROM ' + tableName).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.getDataSetNames = function(datasetId) {
    var tableName = 'dataset_' + datasetId;
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT GROUP_CONCAT(name) AS image_list FROM ' + tableName).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.startNewProgress = function(userId, projectId, userType) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('INSERT INTO progress (id,project_id,progress,user_type) VALUES (?,?,1,?)',
      [userId, projectId, userType]).then(
      function(data) {
        if (data.insertId) {
          resolve(data);
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.addResponse = function(userId, projectId, taskID, response, centerLat, centerLon) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('INSERT INTO response (user_id, project_id,task_id,response, center_lat, center_lon,site_id) VALUES (?,?,?,?,?,?,1)',
            [userId + '', projectId, taskID, response, centerLat, centerLon]).then(
            function(data) {
                if (data.insertId) {
                    resolve(data.insertId);
                } else {
                    error({code: 'Problem with insert'});
                }
            }, function(err) {
                error(err);
            });
    });
};

exports.increaseProgress = function(userId, projectId) {
  return new Promise(function(resolve, error) {
      var connection = db.get();
      connection.queryAsync('update progress set progress = progress + 1 where id = ? and project_id=?',
        [userId + '', projectId]).then(
        function(data) {
          resolve(data.insertId);
          
        }, function(err) {
          error(err);
        });
    }
  );
};

exports.createDataSetTable = function(datasetID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    console.log('creating data set table....'+ datasetID);
    var qstr = 'CREATE TABLE `dataset_' + datasetID + '` (`id` int(11) NOT NULL AUTO_INCREMENT,' +
      ' `name` varchar(200) NOT NULL,' +
      ' `x` varchar(45) DEFAULT NULL,' +
      ' `y` varchar(45) DEFAULT NULL,' +
      ' `flagged` int(1) DEFAULT 0,' +
      ' `active` int(1) DEFAULT 1, PRIMARY KEY (`id`))' +
      ' ENGINE=InnoDB DEFAULT CHARSET=latin1';
    
    connection.queryAsync(qstr).then(function(data) {
      resolve(data);
    }, function(err) {
      error(err);
    });
  });
};

exports.createDataSetItem = function(datasetID, name, x, y) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    var qstr = 'insert into `dataset_' + datasetID + '` (`name`, `x`,`y`)' +
      ' values (?,?,?)';
    
    connection.queryAsync(qstr, [name, x, y]).then(function(data) {
      resolve(data);
    }, function(err) {
      error(err);
    });
  });
};

exports.addDataSetID = function(projectId, dataSetID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('UPDATE projects SET dataset_id=? WHERE id=?',
      [dataSetID, projectId]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

// exports.addSurvey = function(userID, projectID, whyText, whyMore, techDiff, techDiffText, additionalFeedback) {
exports.addSurvey = function(userID, projectID, response) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
        connection.queryAsync('INSERT INTO '+databaseName+'.`survey`(`user_id`,`project_id`,`response`)' +
            'VALUES (?, ?, ?)',
      [userID, projectID, JSON.stringify(response)]).then(
      function(data) {
        if (data.insertId) {
            console.log('In data insert');
          resolve(data.insertId);
        } else {
          error({code: 'Problem with insert'});
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.getAllProjectsForUser = function(userID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('select * from '+databaseName+'.`projects` WHERE `creatorId`=?',
      [userID]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getAllPublicProjects = function() {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        var accessType = 0;

        connection.queryAsync('select * from '+databaseName+'.`projects` WHERE `access_type`=?',
            [accessType]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};

exports.getRandomProjectMturk  = function() {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        connection.queryAsync('select unique_code from selection_mturk;').then(
            function(data) {

                var random_pick = data[Math.floor(Math.random() * data.length)];
                var projectId = random_pick.unique_code;
                resolve(projectId);

            }, function(err) {
                error(err);
            });
    });
};

exports.getNextProjectChain  = function(workerID) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var queryString = "SELECT  s.unique_code FROM selection_mturk s WHERE s.project_id  NOT IN( SELECT t.project_id FROM progress t WHERE t.id = '"
            +  workerID  +"');"


        connection.queryAsync(queryString).then(
            function(data) {

                if (data.length !=0){
                    // //pick the next at random
                    // var random_pick = data[Math.floor(Math.random() * data.length)];
                    // var projectId = random_pick.unique_code;
                    resolve(data);
                } else {
                    resolve([])
                }


            }, function(err) {
                error(err);
            });
    });
};

exports.getProgress = function(projectID, user) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * FROM '+databaseName+'.progress WHERE id=? and project_id=?',
      [user.id, projectID]).then(
      function(data) {
        if (data.length == 0) {
          resolve(null);
        } else {
          resolve(data[0]);
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.getProgressNotNullOnEmpty = function(projectID, user) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * FROM '+databaseName+'.progress WHERE id=? and project_id=?',
      [user.id, projectID]).then(
      function(data) {
        if (data.length == 0) {
          resolve([]);
        } else {
          resolve(data[0]);
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.setArchived = function(projectID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('UPDATE '+databaseName+'.`projects` SET `archived`=1 WHERE `id`=?',
      [projectID]).then(
      function(result) {
        if (result.affectedRows == 1) {
          resolve(result);
        } else {
          error({code: 'Project not found'});
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.setUnArchived = function(projectID) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('UPDATE '+databaseName+'.`projects` SET `archived`=0 WHERE `id`=?',
      [projectID]).then(
      function(result) {
        if (result.affectedRows == 1) {
          resolve(result);
        } else {
          error({code: 'Project not found'});
        }
      }, function(err) {
        error(err);
      });
  });
};

exports.getFeaturedProject = function() {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT * FROM '+databaseName+'.featured_url_route').then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};