 var db = require('../db/db');
 var Promise = require('bluebird');
 var fs = require('fs');
 var path = require('path');
 var databaseName = process.env.CARTO_DB_NAME;

exports.addHubProject = function(name, userID, desc, picID, uniqueCode, url_name,external_sign_up) {
    return new Promise(function(resolve, reject) {
  
      var connection = db.get();
      connection.queryAsync('INSERT INTO hub_projects (name,creatorID,description,cover_pic,hub_unique_code,url_name,external_sign_up) VALUES(?,?,?,?,?,?,?)',
        [name, userID, desc, picID, uniqueCode,url_name,external_sign_up]).then(
        function(result) {
          resolve(result);
        }).catch(function(err) {
        reject(err);
      });
    });
  };

  exports.editHubProject = function(name, desc, picID, uniqueCode, url_name,external_sign_up) {
    return new Promise(function(resolve, reject) {
      var connection = db.get();
      connection.queryAsync('update hub_projects set name=? , description=?, cover_pic=?, url_name=?, external_sign_up=? where hub_unique_code=?',
        [name, desc, picID,url_name,external_sign_up,uniqueCode]).then(
        function(result) {
          resolve(result);
        }).catch(function(err) {
        reject(err);
      });
    });
  };

  exports.publish = function(hub_unique_code) {
    return new Promise(function(resolve, error) {
      var connection = db.get();
      connection.queryAsync('UPDATE hub_projects SET published=1 WHERE hub_unique_code=?',
        [hub_unique_code]).then(
        function(data) {
          resolve(data);
        }, function(err) {
          error(err);
        });
    });
  };
  

exports.getHubFromCode = function(hubUniqueCode) {
    return new Promise(function(resolve, error) {
      var connection = db.get();
      connection.queryAsync('SELECT * from hub_projects WHERE hub_unique_code=?',
        [hubUniqueCode]).then(
        function(data) {
          resolve(data);
        }, function(err) {
          error(err);
        });
    });
  };

  exports.getHubFromURL = function(hubURL) {
    return new Promise(function(resolve, error) {
      var connection = db.get();
      connection.queryAsync('SELECT * from hub_projects WHERE url_name=?',
        [hubURL]).then(
        function(data) {
          resolve(data);
        }, function(err) {
          error(err);
        });
    });
  };


  exports.getAllHubProjectsForUser = function(userID) {
    return new Promise(function(resolve, error) {
      var connection = db.get();
      connection.queryAsync('select * from '+databaseName+'.`hub_projects` WHERE `creatorId`=?',
        [userID]).then(
        function(data) {
          resolve(data);
        }, function(err) {
          error(err);
        });
    });
  };



exports.addSubprojectItems = function(hub_code,subproject_items,categories_items) {
    return new Promise(function(resolve, error) {
      var connection = db.get();

      var subproject_ids = [];
      var dataset_ids = [];
      //we need to store ids, dataset ids and unique codes
      subproject_items.forEach(function(item){
        subproject_ids.push(item.id)
        dataset_ids.push(item.dataset_id)
      })

      connection.queryAsync('update hub_projects set dataset_ids=?,project_codes=?,results_labels=? WHERE hub_unique_code=?',
        [dataset_ids.join(","),subproject_ids.join(","),categories_items.join(","),hub_code]).then(
        function(data) {
          resolve(data);
        }, function(err) {
          error(err);
        });
    });
  };