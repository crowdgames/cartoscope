/**
 * Created by kiprasad on 13/08/16.
 */
var validMimes = ['image/png','image/jpeg'];
var re = /(?:\.([^.]+))?$/;

exports.validMimeTypes = function(mime) {
  if (validMimes.indexOf(mime) > -1) {
    return true;
  }
  return false;
};

exports.extractExtension = function(filename) {
  return re.exec(filename)[1];
};
