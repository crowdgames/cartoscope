/**
 * Created by kiprasad on 21/10/16.
 */
var fs = require('fs');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var path = require('path');
// require exif for reading exif tags
var ExifImage = require('exif').ExifImage;
// set resizeSize for compression
var resizeSize = 640;
var sharp = require('sharp')


exports.processData = function(files) {
  //  console.log('files ', files);
  return new Promise(function(resolve, error) {
      var processingTemp = this.dirName + '/tmp';

      if (!fs.existsSync(processingTemp)) {
        fs.mkdirSync(processingTemp);
      }
      
      var fnameMap = {};
      var pArr = [];
      for (var i in files) {
        var p = readXY(this.dirName + '/' + files[i]);
        p.catch(function(err) {
          return null;
        });
        pArr.push(p);
        
        var p = reduceImage(this.dirName, files[i], processingTemp);
        p.catch(function(err) {
          return null;
        });
        pArr.push(p);
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
      
    }
  );
};

function reduceImage(baseDir, fileName, target) {
  return new Promise(function(resolve, reject) {

      console.log(fileName)

      var target_file = fileName.substring(0, fileName.lastIndexOf(".") + 1) + 'jpg';

      console.log(target_file)
      console.log(target)

      sharp( path.join(baseDir,fileName))
          .resize(resizeSize, resizeSize)
          .toFormat('jpeg')
          .toFile(path.join(target,target_file), function(err) {
              if (err){
                  //console.log("OOPS")
                  //console.log(err)
                  reject(err)

              } else {
                  //console.log("Finished: " + path.join(target,fileName))
                  resolve({
                      compressed: path.join(target,target_file),
                      fileName: target_file
                  })
              }
          });
    })
}


function reduceImage2(baseDir, fileName, target) {
    return new Promise(function(resolve, reject) {
        var testCall = spawn('python', [path.resolve(__dirname + '/../scripts/imagecompression.py'),
            baseDir, fileName, target, resizeSize]);
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


function readXY(fName) {
  return new Promise(function(resolve, reject) {
    try {
      new ExifImage({image: fName}, function(error, exifData) {
        if (!error) {
            var gps = exifData.gps;
          //  console.log('in gps ', gps);
        }

          var data = {};
          data.name = path.parse(fName).name;

          if (!gps) {
              data.x = 42.1111;
              data.y = -82.1111;
          } else{
              var gpsLatitude = gps.GPSLatitude || 0;
              var gpsLongitude = gps.GPSLongitude || 0;

              var gpsLatitudeR = gps.GPSLatitudeRef || 0;
              var gpsLongitudeR = gps.GPSLongitudeRef || 0;

              var data = {};
              data.name = path.parse(fName).name;

              gpsLatitude = convertToDegrees(gpsLatitude);
              gpsLongitude = convertToDegrees(gpsLongitude);

              if (!(gpsLatitudeR == 'N')) {
                  gpsLatitude = 0 - gpsLatitude;
              }

              if (!(gpsLongitudeR == 'E')) {
                  gpsLongitude = 0 - gpsLongitude;
              }

              data.x = gpsLatitude;
              data.y = gpsLongitude;
          }
         // console.log('in resolve ', data);
        resolve(data);
      });
    } catch (error) {
        console.log("WOOPS")
      reject(error);
    }
  }).catch(function(err) {
      reject(err);
  });

}

function convertToDegrees(value) {
  var val = value;
  
  var d = val[0];
  var m = val[1];
  var s = val[2];
  
  return (d + (m / 60.0) + (s / 3600.0));
}
