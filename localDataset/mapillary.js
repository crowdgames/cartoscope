const Utility = require('./Utility');


exports.buildDataSet = (state, city, indexNotConverted, callback) => {
	const index = Number(indexNotConverted);
	if (isNaN(index)) {
		callback(true, 'Received index that was not a number. Contact admin.');
		return;
	}

  Utility.validateUserInput(state, city, (error, latitude, longitude) => {
    if (error) {
      callback(false, 'Invalid city or state or both.');
			return;
    } else {
      // If the driectory already exists than we can tell the caller that the dataset has been made
      // which we singify with no error being found. otherwise, we make a temp file to tell any
      // other calls that we are in the process of making the dataset. 
      const dir = `dataset/mapillary_${state}_${city}_v${index}`;
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
          
          // const process = spawn('python',[path.resolve(__dirname + '/../scripts/emh-test-weighted.py'),
          //   path.resolve(__dirname + '/../scripts/seeds/'+ main_code + '_worker_paths_random.csv')]
          // );
        }
      }
    }
  });
}
