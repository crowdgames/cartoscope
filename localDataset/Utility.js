'use strict';

const archiver = require('archiver');

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
   input: fs.createReadStream('scripts/locations.csv'),
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

exports.zipAndSendDataSet = (dir, res) => {
  let attempts = 0;
	const lockFile = `${dir}.temp`;

  // I'm using location_ for inaturalist. I don't want to mess with the old code so I want
  // to change it to use mapillary_ for the next part which means I need to make this part
  // no longer hardcoded. Just using dir isn't good enough (as much as I wish it was :/).

  if (fs.existsSync(lockFile)) {
    console.log(`dataset |${name}| is still being made`);
    res.status(202).send('Dataset creation still in process');
    break;
  }

  if (!fs.existsSync(dir)) {
    console.log(`dataset |${name}| does not exist. Error`);
    res.status(404).send('Dataset has not been made.');
    break;
  }

  const zipName = `ar_zip/location_${name}.zip`;
  if (fs.existsSync(zipName)) {
    console.log(`Dataset ${name} already exists. Sending result.`);
    res.download(zipName, `${name}.zip`);
    break;
  }

  for(var i = 0; i < 10; ++i) {
    console.log(`zipping data for ${name}`);
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
    archive.directory(dir, false);
    archive.finalize();
  }

  if (attempts >= 10) {
		res.status(404).send('Could not generate zip');
    fs.rmdirSync(dir, { recursive: true });
  }
};
