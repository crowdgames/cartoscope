
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



//endpoint for sorting them into a dataset
router.get('/compareTGCC/:hit_id', function(req, res, next) {


    //2 datasets: cats dogs, bridges
    //3 interfaces, CC, TG and TG-BIG
    // var possibles_pool = [
    //     {'interface': 'CC', 'dataset': 'EGHiAhY5ucce' , 'name': 'bridges'},
    //     {'interface': 'CC', 'dataset': 'XtdcMntF37R9' , 'name': 'catdogs'},
    //     {'interface': 'TG', 'dataset': 'brs' , 'name': 'bridges_small'},
    //     {'interface': 'TG', 'dataset': 'cas' , 'name': 'catdogs_small'},
    //     {'interface': 'TG', 'dataset': 'brb' , 'name': 'bridges_big'},
    //     {'interface': 'TG', 'dataset': 'cab' , 'name': 'catdogs_big'}
    // ];
    var possibles_pool = [
        {'interface': 'CC', 'dataset': 'EGHiAhY5ucce' , 'name': 'bridges'},
        {'interface': 'TG', 'dataset': 'brb' , 'name': 'bridges_big'},
        {'interface': 'TG', 'dataset': 'brb0' , 'name': 'bridges_big_0'}
    ];

    var hit_id = req.params.hit_id;
    var pick_d = randomInt(0,possibles_pool.length - 1); //pick dataset [start,end]
    var selected_d = possibles_pool[pick_d];
    var interface_version = selected_d.interface;
    var dataset = selected_d.dataset;
    var link = "";

    console.log(interface_version,dataset)

    //if pick Tile-o-Scope Grid, then go to TG, else go to Cartoscope Classic
    if (interface_version == "TG"){
        //nob means no bonus, nop means no penalty, capl means cap them at certain amount of images
        link = 'http://cartosco.pe/Tiles/?genetic='+ dataset +'&trialId=' + hit_id + '&nob=1&nop=1&capl=1';

    } else {
        link = 'https://cartosco.pe/api/anon/startAnon/'+ dataset + '?trialId='+ hit_id;
    }
    //redirect to link:
    res.redirect(link)

});

//endpoint for Qlearn old vs Qlearn adaptive vs Greedy
router.get('/compareTGQ/:hit_id', function(req, res, next) {

    var hit_id= req.params.hit_id;
    var train_hit = req.params.train_hit;

    var possibles = [
        'qlearn=' + hit_id + '&train_hit=O01MB2E67SUU',
        'qlearnO='+ hit_id,
        'genetic=GNEPFHZXA6QL',
        'random=' + hit_id
    ];

    var pick_d = randomInt(0,possibles.length - 1); //pick dataset
    var selected_d = possibles[pick_d];


    var link = 'http://cartosco.pe/Tiles/?' + selected_d +'&trialId=' + hit_id ;


    //redirect to link:
    res.redirect(link)

});

//healthy gulf: Landloss Lookout, mturk randomized
router.get('/hgtest/:hit_id', function(req, res,next) {

    console.log(req.params);

    var hit_id = req.params.hit_id;


    var subprojects = ["UOYIiFeapnyI","ocioawiaGcjw","KyW6Ti9QUr4I","Srz9arMDwthQ","94yoCWhFkpMk","cXz6ImkmG9k5"];
    var pick_d = randomInt(0,subprojects.length - 1); //pick dataset [start,end]
    var project_code = subprojects[pick_d];
    var link = "kioskProject.html#/kioskStart/" + project_code + '?trialId=' + hit_id;
    res.redirect('http://cartosco.pe/' + link); // send to project page

});


//return random integer [min,max]
function randomInt(min,max){
    return (Math.floor(Math.random() * (max - min + 1) ) + min);
}

