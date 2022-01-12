'use strict';

const archiver = require('archiver');
const readline = require('readline');
const fs = require('fs');

/**
* Read from csv of US cities to find latitude and longitude. 
* @param {string} state 
* @param {string} city 
* @param {function} callback 
*/
exports.validateCityAndState = (state, city, callback) => {
 state = state.toLowerCase();
 city = city.toLowerCase();

 const readInterface = readline.createInterface({ 
   input: fs.createReadStream('localDataset/locations.csv'),
 });

 let found = false;
 readInterface
   .on('close', () => {
     if (!found) {
       callback(true, 'Unable to find city and state.', null);
       return;
     } 
   })
   .on('line', (line) => {
     const split = line.split(',');
     const newState = split[1].toLowerCase();
     const newCity = split[3].replace(/['"]+/g, '').toLowerCase();

     if (newState === state && newCity === city) {
       found = true;
       readInterface.close(); // stop extra processing and error message being sent
       readInterface.removeAllListeners()
       callback(false, parseFloat(split[5]), parseFloat(split[6]));
     }
   });
};

exports.zipAndSendDataSet = (dir, name, res) => {
  const lockFile = `${dir}/${name}.temp`;
  const datasetDir = `${dir}/${name}`;
  
  if (fs.existsSync(lockFile)) {
    console.log(`dataset |${name}| is still being made`);
    res.status(202).send('Dataset creation still in process');
    return;
  }
  
  if (!fs.existsSync(datasetDir)) {
    console.log(`dataset |${name}| does not exist. Error`);
    res.status(404).send('Dataset does not exist.');
    return;
  }
  
  const zipName = `ar_zip/${name}.zip`;
  if (fs.existsSync(zipName)) {
    console.log(`Dataset ${name} already exists. Sending result.`);
    res.download(zipName, `${name}.zip`);
    return;
  }
  
  let attempts = 0;
  for(; attempts < 10; ++attempts) {
    console.log(`zipping data for ${name}, attempt=${attempts}`);
    const outputStream = fs.createWriteStream(zipName);
    const archive = archiver('zip');
  
    outputStream.on('close', () => {
      console.log(`zipping |${name}| complete, sending result.`);
      res.download(zipName, `${name}.zip`);
    });
  
    archive.on('error', (err) => {
      console.log(`zip error: ${err}`)
      zipAndSendDataSet(state, city, index, attempts + 1, res);
    });
  
    archive.pipe(outputStream);
    archive.directory(datasetDir, false);
    archive.finalize();
  }

  if (attempts >= 10) {
		res.status(404).send('Could not generate zip');
    fs.rmdirSync(datasetDir, { recursive: true });
  }
};


exports.destroyFileIfExists = (file) => {
	fs.exists(file, (exists) => {
    if (exists) {
      fs.unlink(file, (err) => {
        if (err) {
          console.log(`Unable to delete: ${file}`);
          console.log(err);
        } else {
          console.log(`Deleted: ${file}`);
        }
      });
    } else {
      console.log(`${file} already destroyed.`);
    }
  });
};