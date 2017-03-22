/**
 * Created by kiprasad on 31/07/16.
 */

var mysql = require('mysql');
var Promise = require('bluebird');

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

var state = {
  pool: null,
  mode: null
};

exports.connect = function(mode, done) {
   state.pool = mysql.createPool({
    host: process.env.DB_HOST ? process.env.DB_HOST : '',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  state.mode = mode;
  done();
};

exports.get = function() {
  return state.pool;
};
