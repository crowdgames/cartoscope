const Utility = require('./Utility');
const fs = require('fs');
const spawn = require("child_process").spawn;
const rimraf = require('../localDataset/rimraf');

exports.buildDataSet = (dataset, state, city, indexNotConverted, callback) => {
	const index = Number(indexNotConverted);
	if (isNaN(index)) {
    	callback(true, 'Received index that was not a number. Contact admin.');
    	return;
    }

  if (index !== 0) {
    callback(true, 'Our Mapillary implementation does not currently support multiple datasets per city.');
    return;
  }
    
  Utility.validateCityAndState(state, city, (error, latitude, longitude) => {
    if (error) {
      callback(false, 'Invalid city or state or both.');
			return;
    } else {
      // If the driectory already exists than we can tell the caller that the dataset has been made
      // which we singify with no error being found. otherwise, we make a temp file to tell any
      // other calls that we are in the process of making the dataset. 
      const dir = `dataset/location_${dataset}_${state}_${city}_v${index}`;
      const shortName = `${state}_${city}_v${index}`;

      if (fs.existsSync(dir)) {
        callback(false, 'Dataset already exists.');
				return;
      } else {
        const lockFile = `${dir}.temp`;
        if (fs.existsSync(lockFile)) {
          callback(false, 'Dataset is being made.');
					return;
        } else {
          fs.closeSync(fs.openSync(lockFile, 'w'));
          fs.mkdirSync(dir);
          
          // Python script takes in latitude and longitude in the opposite order since 
          // Mapilly does (for some reason).
          console.log('starting python process ::', longitude-2, latitude-2, longitude + 2, latitude + 2);
          const process = spawn('python3.6', [
            './localDataset/create_mapillary_dataset.py', 
            dir, 
            shortName, 
            longitude-2, 
            latitude-2, 
            longitude+2, 
            latitude+2
          ]);

          process.stdout.on('data', (data) => {
            console.log(`python -> ${data}`);
          });

          process.stderr.on('data', (data) => {
            console.error(`python err -> ${data}`);
          });

          process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            Utility.destroyFileIfExists(lockFile);

            if (code === 0) {
              callback(false, 'Dataset made!')
            } else {
              rimraf(dir, () => {
                callback(true, 'Dataset failed to create. Please try again and/or contact an admin.')
              })
            }
          });
        }
      }
    }
  });
}
