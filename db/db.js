/**
 * Created by kiprasad on 31/07/16.
 */

/**
converge database details.
*/
var mysql = require('mysql');
var Promise = require('bluebird');

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

var PRODUCTION_DB = 'convergeDB';
var TEST_DB = 'convergeDB';

exports.MODE_TEST = 'development';
exports.MODE_PRODUCTION = 'production';

var state = {
  pool: null,
  mode: null
};

exports.connect = function(mode, done) {
    state.pool = mysql.createPool({
        host: process.env.DB_HOST ? process.env.DB_HOST : '',
        user: process.env.CARTO_DB_USER,
        password: process.env.CARTO_DB_PASSWORD,
        database: process.env.CARTO_DB_NAME
    });
    state.mode = mode;
    done();
};

exports.get = function() {
  return state.pool;
};




