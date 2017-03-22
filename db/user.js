var db = require('../db/db');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
const saltRounds = 10;

exports.getUser = function(id, isActive, done) {
  var connection = db.get();
  connection.query('SELECT id,username,email,profile_photo,created_at,updated_at,short_bio, ' +
    'last_login FROM users where id = ? and is_active=?', [id, isActive ? 1 : 0],
    function(err, result) {
      if (err) {
        return done(err, {});
      }
      console.log('get ', result);
      done(null, result);
    });
};

exports.getUserByID = function(id) {
  return new Promise(function(resolve, error) {
    var connection = db.get();
    connection.queryAsync('SELECT id, username FROM users where id = ?', [id]).then(
      function(data) {
        resolve(data);
      }, function(err) {
        error(err);
      });
  });
};

exports.getUserId = function(username, email, done) {
  var connection = db.get();
  connection.query('SELECT id FROM users where username = ? and email = ? and is_active=1', [username, email],
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.checkUserID = function(id, done) {
  var connection = db.get();
  connection.query('SELECT 1 FROM users where username = ?', id,
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.getUsers = function(username, done) {
  var connection = db.get();
  connection.query('SELECT id,username FROM users where username like ? and is_active=1', '%' + username + '%',
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.checkEmail = function(email, done) {
  var connection = db.get();
  connection.query('SELECT 1 FROM users where email = ?', email,
    function(err, result) {
      if (err) {
        return done(err);
      }
      done(null, result);
    });
};

exports.addUser = function(name, email, password, agreeMail, agreeNewProject, profilePhotoId, done) {
  var connection = db.get();
  connection.query('INSERT INTO users (username,email,agree_mail,agree_help,profile_photo,short_bio) ' +
    'VALUES(?, ?, ?, ?, ?, \'\')', [name, email, agreeMail ? 1 : 0, agreeNewProject ? 1 : 0, profilePhotoId, ''],
    function(err, result) {
      if (err) {
        return done(err);
      }
      
      var salt = bcrypt.genSaltSync(saltRounds);
      var hash = bcrypt.hashSync(password, salt);
      
      connection.query('INSERT INTO password (id,salt,password) VALUES(?, ?, ?)',
        [result.insertId, salt, hash],
        function(err, res) {
          if (err) {
            return done(err);
          }
          done(null, result.insertId);
        });
    });
};

exports.deleteUser = function(id, done) {
  var connection = db.get();
  connection.query('UPDATE users SET is_active=0 WHERE id=?', id, function(err, result) {
    if (err) {
      return done(err);
    }
    done(null, result.affectedRows);
  });
};

exports.getUserWithPassword = function(username, password, done) {
  var connection = db.get();
  connection.query('SELECT id,email,username FROM users where username = ? and is_active=1',
    username,
    function(err, result) {
      if (err) {
        return done(err);
      }
      result = result[0];
      if (result && 'id' in result) {
        connection.query('SELECT password FROM password where id = ?', result.id,
          function(err, res) {
            if (err) {
              return done(err);
            }
            res = res[0];
            if ('password' in res && bcrypt.compareSync(password, res.password)) {
              done(null, result);
            } else {
              done(null, null);
            }
          });
      } else {
        done(null, null);
      }
    });
};

exports.setLastLogin = function(id) {
  var connection = db.get();
  connection.query('UPDATE users SET last_login=CURRENT_TIMESTAMP WHERE id=? and is_active=1', id);
};
