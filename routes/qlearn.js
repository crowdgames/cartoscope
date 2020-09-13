var resultDB = require('../db/results');
var anonUserDB = require('../db/anonUser');
var projectDB = require('../db/project');
var tileDB = require('../db/tileoscope');
var dynamicDB = require('../db/dynamic');
var qlearnDB = require('../db/qlearn');
var inatDB = require('../db/inaturalist');
var Promise = require('bluebird');

var bcrypt = require('bcrypt');

var filters = require('../constants/filters');
var express = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();
var fs = require('fs');
var archiver = require('archiver');
var json2csv = require('json2csv');
var d3 = require('d3');
var CARTO_PORT = process.env.CARTO_PORT || '8081';
var salt = process.env.CARTO_SALT;

var path = require('path');
module.exports = router;


router.get('/generateQTableStatic/:main_code/:train_id', function(req, res, next) {

    qlearnDB.generateSequenceQlearnStatic(req.params.main_code,req.params.train_id).then(function(dat) {
        res.send(dat)
    },function(err){
        console.log(err)
        res.status(500).send(err)
    })
})

router.get('/generateQTableAdaptive/:main_code/:train_id', function(req, res, next) {

    qlearnDB.generateQTableAdaptive(req.params.main_code,req.params.train_id).then(function(dat) {
        res.send(dat)
    },function(err){
        console.log(err)
        res.status(500).send(err)
    })
})


router.get('/fetchQTable/:main_code/:mode', function(req, res, next) {

    qlearnDB.fetchQTableByCode(req.params.main_code,req.params.mode).then(function(dat) {
        res.send(dat)
    },function(err){
        console.log(err);
        res.status(500).send(err)
    })
});


router.post('/simulateNextLevel', function(req, res, next) {

    qlearnDB.fetchQTableByCode(req.body.main_code,req.body.mode).then(function(Q) {

        var Q_format = qlearnDB.convertQtableFormat(Q);
        var res_seq = qlearnDB.QlearnAlgorithmConstruct(Q_format,req.body.path_size,qlearnDB.encodeMistakes(req.body.player_mistakes),req.body.user_path);
        console.log(res_seq)
        res.send(res_seq.join('-'))
    },function(err){
        console.log(err);
        res.status(500).send(err)
    })
});