var express = require('express');
var router = express.Router();
var projectDB = require('../db/project');

module.exports = router;

router.get('/', function(req, res, next) {

    projectDB.getFeaturedProject().then(function(data) {
    var redirectUrl = '/';
    if(data.length > 0) {
      var featured = data[0];
      if (featured.code) {
        redirectUrl = '/#kioskProject/'+featured.code;
      } else if(featured.url) {
        redirectUrl = featured.url;
      }
    }
    res.writeHead(302, {
      'Location': redirectUrl
    });
    res.end();
  });
});

