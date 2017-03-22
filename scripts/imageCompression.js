/**
 * Created by kiprasad on 21/10/16.
 */
var fs = require('fs');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var path = require('path');

exports.processData = function(files) {
  return new Promise(function(resolve, error) {
    var processingTemp = this.dirName + '/tmp';
    if (!fs.existsSync(processingTemp)) {
      fs.mkdirSync(processingTemp);
    }
    
    var fnameMap = {};
    var pArr = [];
    for (var i in files) {
      var fileNameSplit = files[i].split('.');
      if (fileNameSplit[1] == 'wld') {
        var p = readXY(fileNameSplit[0]);
        p.catch(function(err) {
          return null;
        });
        pArr.push(p);
      } else if (fileNameSplit[fileNameSplit.length - 1] == 'jpg') {
        var p = reduceImage(this.dirName, files[i], processingTemp);
        p.catch(function(err) {
          console.log(err);
          return null;
        });
        pArr.push(p);
      }
    }
    var dirName = this.dirName;
    Promise.all(pArr).then(function(dataArr) {
      var compressedImages = [];
      for (var i in dataArr) {
        var data = dataArr[i];
        if (data != null && 'x' in data) {
          fnameMap[data.name] = data;
          delete data.name;
        } else if (data != null && 'compressed' in data) {
          compressedImages.push(data);
        }
      }
      
      for (var f in files) {
        fs.unlinkSync(dirName + '/' + files[f]);
      }
      
      for (f in compressedImages) {
        var file = compressedImages[f];
        fs.renameSync(file.compressed, dirName + '/' + file.fileName);
      }
      
      resolve(fnameMap);
    }).catch(function(err) {
      error(err);
    });
    
  });
};

function reduceImage(baseDir, fileName, target) {
  return new Promise(function(resolve, reject) {
    var testCall = spawn('python', [path.resolve(__dirname + '/../scripts/imagecompression.py'),
      baseDir, fileName, target]);
    testCall.stdout.on('data', function(data) {
    });
    testCall.on('close', function(code) {
      if (code == 0) {
        resolve({
          compressed: target + '/' + fileName,
          fileName: fileName
        });
      } else {
        reject(code);
      }
    });
  });
}

function readXY(fname) {
  return new Promise(function(resolve, error) {
    //console.log(fname);
    fs.readFile(this.dirName + '/' + fname + '.wld', 'utf8', function(err, data) {
      if (err) {
        error(err);
      }
      var lines = data.split('\n');
      data = {};
      data.name = fname;
      data.x = lines[4];
      data.y = lines[5];
      resolve(data);
    });
  });
}
