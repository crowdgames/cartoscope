/**
 * Created by kiprasad on 30/08/16.
 */
var db = require('../db/db');
var Promise = require('bluebird');
var databaseName = process.env.CARTO_DB_NAME;

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


exports.updateImageSource = function(projectId, image_source) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('UPDATE projects SET image_source=? WHERE id=?',
            [image_source, projectId]).then(
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


exports.updateDescriptionName = function(projectId, description,name) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('UPDATE projects SET description=? , name=? WHERE id=?',
            [description,name, projectId]).then(
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
        var queryString = 'SELECT * from tutorial WHERE unique_code = \'' + uniqueCode + '\'';
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

//Add a new genetic sequence, as long as it doesn't already exist
exports.addTutorialSequence = function (uniqueCode,sequence) {

    return new Promise(function(resolve, error) {
        var connection = db.get();
        var queryString = 'INSERT INTO tutorial_sequences (unique_code,seq,active) ' +
            'SELECT * FROM (SELECT \"'+uniqueCode+'\", \"'+ sequence +'\", \'1\') AS tmp ' +
            'WHERE NOT EXISTS (SELECT * FROM tutorial_sequences where ' +
            'unique_code=\"'+ uniqueCode +'\" and seq=\"'+ sequence +'\") LIMIT 1';
        connection.queryAsync(queryString).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


exports.getTutorialSequenceRandom = function(uniqueCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        //get a random sequence
        var queryString = 'SELECT id from tutorial_sequences WHERE unique_code = \'' + uniqueCode + '\' ORDER BY RAND() LIMIT 1';
        connection.queryAsync(queryString).then(
            function(data) {
                if (data.length > 0) {
                    var seq_id = data[0].id;
                    //Return tutorial points but with added sequence column
                    queryString = 'SELECT t.*,ts.seq from tutorial as t ' +
                        'JOIN tutorial_sequences as ts on  t.unique_code=ts.unique_code and ts.id=' + seq_id +
                        ' WHERE t.unique_code = \'' + uniqueCode + '\' ';
                    connection.queryAsync(queryString).then(
                        function(data2) {
                            if (data2.length > 0) {
                                //Return tutorial points but with added sequence column
                                resolve(data2);
                            } else {
                                error({code: 'Error getting tutorial with sequence'});
                            }
                        }, function(err) {
                            error(err);
                        });
                } else {
                    error({code: 'No tutorial sequence found'});
                }
            }, function(err) {
                error(err);
            });
    });
};


exports.getTutorialSequenceRandomGenetic = function(uniqueCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        //get a random sequence
        var queryString = 'SELECT id from task_genetic_sequences WHERE active=1 and unique_code_main = \'' + uniqueCode + '\' ORDER BY RAND() LIMIT 1';
        connection.queryAsync(queryString).then(
            function(data) {
                if (data.length > 0) {
                    var genetic_id = data[0].id;
                    resolve(genetic_id);
                } else {
                    error( 'No task genetic sequence found');
                }
            }, function(err) {
                error(err);
            });
    });
};

exports.getTutorialSequenceRandomGeneticFull = function(uniqueCode) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        //get a random sequence
        var queryString = 'SELECT * from task_genetic_sequences WHERE active=1 and unique_code_main = \'' + uniqueCode + '\' ORDER BY RAND() LIMIT 1';
        connection.queryAsync(queryString).then(
            function(data) {
                if (data.length > 0) {

                    resolve(data);
                } else {
                    error( 'No task genetic sequence found');
                }
            }, function(err) {
                error(err);
            });
    });
};

exports.generateTutorialSequencesRandom = function(uniqueCode,selsize) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        //get all tutorial items for that code in random order
        var queryString = 'SELECT id from tutorial WHERE unique_code = \'' + uniqueCode + '\' ORDER BY RAND() ';
        connection.queryAsync(queryString).then(
            function(data) {
                if (data.length > 0) {
                        // array of all ids
                        var complete = 0;
                        var seqArray = [];
                        data.forEach(function(item){
                            seqArray.push(item.id)
                        });
                        // We have a random sequence of all items, now select a random size between 0-array_size:
                        //Do not allow sequences of only one item:
                        var rand_size = 0;
                        if (selsize > 0) {
                            rand_size = selsize;
                        } else {
                            rand_size = Math.floor(Math.random() * (seqArray.length +1)) +1;
                        }

                        var finalSequenceArray = seqArray.slice(0,rand_size);
                        //make it to string
                        var finalSequence = finalSequenceArray.join("-");
                        //Insert sequence to database
                        exports.addTutorialSequence(uniqueCode,finalSequence).then(function(Adddata) {
                            if (Adddata) {
                                rows_changed = Adddata.affectedRows;
                                if (rows_changed > 0){
                                    complete = 1;
                                }
                                resolve(complete)
                            } else {
                                error({code: 'Error adding generated sequence'});
                            }
                        }, function(err) {
                            error(err);
                        });

                } else {
                    error({code: 'No tutorial items found'});
                }
            }, function(err) {
                error(err);
            });
    });
};


//Keep track of which worker is matched with which sequence (tutorial)
exports.addUserTutorialSequence = function(worker_id,hitID,unique_code,sequence) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('INSERT INTO tutorial_users (unique_code,workerID,hitID,seq) VALUES(?,?,?,?)',
            [unique_code,worker_id,hitID,sequence]).then(
            function(data) {
                resolve(data);
            }, function(err) {
                error(err);
            });
    });
};


exports.importSettingsFromProject = function(new_code, pObj){
    return new Promise(function(resolve, error) {
        var connection = db.get();
        var obj_list = [];
        //from pObj, pop id,created_at and last_modified: should not be altered
        var old_unique_code = pObj["unique_code"];
        delete pObj["unique_code"];
        delete pObj["id"];
        delete pObj["created_at"];
        delete pObj["last_modified"];
        //update code:
        //then, for each remaining object key pair, make a key=key.value string
        for (key in pObj){
            obj_list.push(key)
        }
        var query = "INSERT INTO projects ( " + obj_list.toString() + ",unique_code)" +
        " SELECT " + obj_list.toString() +  " ,\"" + new_code + "\"" +
        " from projects where unique_code=\"" + old_unique_code + "\"";

        //end query with project
        connection.queryAsync(query).then(
            function(data) {
                resolve(new_code);
            }, function(err) {
                error(err);
                console.log(err)
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


exports.getDataSetNames2 = function(datasetId) {
    var tableName = 'dataset_' + datasetId;
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT name,x,y  FROM ' + tableName).then(
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
        console.log("NAME with issue")
        console.log(name)

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

//get progress for multiple projects at the same time
exports.getProgressNotNullOnEmptyMultipleCodes = function(projectID_list, user) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var pList_string = "'" + projectID_list.join("','") + "'";
        connection.queryAsync('select pr.id,pr.project_id,pr.progress,p.unique_code from progress as pr \
        LEFT JOIN projects as p ON pr.project_id=p.id \
        WHERE pr.id=? and p.unique_code IN ('+ pList_string +')',
            [user.id]).then(
            function(data) {
                if (data.length == 0) {
                    resolve([]);
                } else {
                    resolve(data);
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

//get info for genetic id
exports.getTaskGeneticInfoForUser = function(projectID, user) {
    return new Promise(function(resolve, error) {
        var connection = db.get();
        connection.queryAsync('SELECT m.workerID,m.genetic_id,t.seq,t.label_project,t.map_project,t.marker_project,t.progress_type' +
            ' FROM '+databaseName+'.mturk_workers as m left join  ' + databaseName +
            '.task_genetic_sequences as t on m.genetic_id=t.id WHERE m.workerID=? and m.projectID=?',
            [user.id, projectID]).then(
            function(data) {
                if (data.length == 0) {
                    resolve([]);
                } else {
                    resolve(data[0]);
                }
            }, function(err) {
                console.log(err)
                error(err);
            });
    });
};



//get info for genetic id
exports.registerProgressGenetic = function(projectID, user) {
     return new Promise(function(resolve, error) {
            var connection = db.get();
            connection.queryAsync('INSERT INTO progress (id,project_id,progress,user_type)' +
                ' VALUES (?,?,1,1)',
                [user.id, projectID]).then(
                function(data) {
                    if (data.insertId) {
                        console.log('In data insert');
                        var res_data = {
                            id: user.id,
                            project_id:projectID,
                            progress: 1,
                            user_type: user.user_type
                        }
                        resolve(res_data);
                    } else {
                        error({code: 'Problem with insert'});
                    }
                }, function(err) {
                    error(err);
                });
        });
    };

//get all tutorial objects
exports.getTutorialItemsMultipleCodes = function(projectID_list) {
    return new Promise(function(resolve, error) {
        var connection = db.get();

        var pList_string = "'" + projectID_list.join("','") + "'";
        connection.queryAsync('select t.image_name, t.x, t.y, t.zoom, t.answer, t.explanation, t.poi_name, \
        p.point_selection,p.points_file,p.tutorial_link,p.template,p.unique_code,p.image_source \
           from tutorial as t \
        LEFT JOIN projects as p ON t.unique_code=p.unique_code \
        WHERE  p.unique_code IN ('+ pList_string +')').then(
            function(data) {
                if (data.length == 0) {
                    resolve([]);
                } else {
                    resolve(data);
                }
            }, function(err) {
                error(err);
            });
    });
};