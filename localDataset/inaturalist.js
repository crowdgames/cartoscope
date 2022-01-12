'use strict';

const Utility = require('./Utility');

const fs = require('fs');
const axios = require('axios');
const path = require('path');
const uuid4 = require('uuid4');
const sharp = require('sharp');

const MAX_CATEGORIES = 7;
const MIN_CATEGORIES = 3;
const DATASET_SIZE = 12;
const MAX_PAIRS = Math.floor(DATASET_SIZE / MIN_CATEGORIES);

const acceptedLicenses = {
  'cc0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-nc': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-nc-sa': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}

// this could be improved with binary insertion sort
const sortDataset = (dataset) => {
  const toBeSorted = []
  for(let key in dataset) {
    toBeSorted.push([key, dataset[key].length]);
  }

  toBeSorted.sort((left, right) => {
    if (left[1] < right[1]) {
      return 1;
    } else {
      return -1;
    }
  });

  return toBeSorted;
};

const download = (dir, info) => {
  axios({
    method: 'get',
    url: info.url.replace('square', 'original'), // highest res photo
    responseType: 'stream'
  }).then((photoResponse) => {
    // save photo
    const photoExtension = info.url.split('.').pop().split('?')[0];
    const photoSaveNameTemp = path.join(dir, `${info.fileName}_temp.${photoExtension}`);
    const photoSaveName = path.join(dir, `${info.fileName}.${photoExtension}`);
    const stream = fs.createWriteStream(photoSaveNameTemp);
    photoResponse.data.pipe(stream);

    // modify photo to always be 512x512
    stream.on('finish', () => {
      sharp(photoSaveNameTemp)
        .resize({width: 512, height: 512})
        .toFile(photoSaveName)
        .then(() => {
          // given no error, write JSON file
          const upperLicense = info.licenseCode.toUpperCase();
          const licenseURL = acceptedLicenses[info.licenseCode];
          const atr = `Image from [iNaturalist](https://www.inaturalist.org), ${info.attribution}, under [${upperLicense}](${licenseURL}), and may have been cropped or scaled.`;
          const meta = {
            id: info.id,
            category: info.category,
            category_hint: info.categoryHint,
            attribution: atr,
            latitude: info.latitude,
            longitude: info.longitude,
            source: {
              name: 'iNaturalist',
              url: 'https://www.inaturalist.org/',
              observation_id: info.objID,
              photo_id: info.photoID
            }
          }

          fs.writeFile(path.join(dir, `${info.fileName}.json`), JSON.stringify(meta, null, 2), (err) => {
            if (err) {
              console.log(err);
            }

            fs.unlink(photoSaveNameTemp, err => {});
          });
        })
        .catch((err) => {
          console.log('-----------------------')
          console.log('sharp error.');
          console.log(err.stack);
          console.log(err);
          console.log(info);
          console.log('-----------------------')
        });
    });
  })
  .catch((err) => {
    console.log('download error.');
    console.log(err.stack);
    console.log(info);
		callback();
  });
};

const validResult = (result) => {
	try {
    if (result === undefined) return false;
    if (!('id' in result)) return false;

    if (!('license_code' in result)) return false;
    if (result.license_code === null) return false;
    if (!(result.license_code in acceptedLicenses)) return false;
  
    if (!('taxon' in result)) return false;
    if (!('rank' in result.taxon)) return false;
    if (result.taxon.rank !== 'species')  return false;
    if (!('default_photo' in result.taxon)) return false;
    if (!('license_code' in result.taxon.default_photo)) return false;
    if (result.taxon.default_photo.license_code === null) return false;
    if (!(result.taxon.default_photo.license_code in acceptedLicenses)) return false;

    if (!('photos' in result)) return false;
    if (result.photos.length == 0) return false;
    if (!('license_code' in result.photos[0])) return false;
    if (result.photos[0].license_code === null) return false;
    if (!(result.photos[0].license_code in acceptedLicenses)) return false;

    if (!(result.photos[0].url.includes('https://inaturalist-open-data.s3'))) return false;

    if (result.photos[0].url === result.taxon.default_photo.url) return false;

  	return true;
	} catch(e) {
		return false;
	}
}

const getKeyToNumToDownload = (dataset, keys) => {
  let size = 0;
  let categories = 0;
  let result = {};
  let sorted = sortDataset(dataset)
  let i = 0;

  for (; i < sorted.length; ++i) {
    const key = sorted[i][0];
    const occurrences = sorted[i][1];
    const categoryPairs = Math.floor(occurrences / 2.0);
    if (categoryPairs > 0) {
      const numPairs = Math.min(MAX_PAIRS, categoryPairs);
      result[key] = numPairs;
      size += numPairs;
      ++categories;

      if (size >= DATASET_SIZE) {
        break;
      }
    }
  }

  if (categories >= MAX_CATEGORIES) {
    return null;
  } else if (size > DATASET_SIZE) {
    if (categories < MIN_CATEGORIES) {
      return null;
    }
  }

  if (size !== DATASET_SIZE) {
    return null;
  }

  // the first element will be the most populated. Remove one pair and we use
  // the exptra space for the other category. If we can't find one then we 
  // return null else we're golden. We modify the dataset and then everything
  // else just works (in theory). 
  --sorted[0];
  let found = false;
  ++i;
  for(; i < sorted.length; ++i) {
    const key = sorted[i][0];
    const occurrences = sorted[i][1];
    const categoryPairs = Math.floor(occurrences / 2.0);
    if (categoryPairs > 0) {
      result['other'] = 1;
      dataset['other'] = dataset[key];
      for(let j = 0; j < dataset['other'].length; ++j) {
        dataset['other'][j].category = 'other';
        dataset['other'][j].categoryHint = 'other';
      }

      found = true;
      break;
    }
  }

  if (!found) {
    result = null;
  }

  return result;
};

const pruneDataset = (dataset, toDownloadSet) => {
  for(let key in toDownloadSet) {
    for (let i = 0; i < toDownloadSet[key]; ++i) {
      dataset[key].shift();
    }
  }
};

const processData = (dir, data, datasetInfo, callback) => {
  let dataset = datasetInfo.dataset;
  let usedIds = datasetInfo.usedIds;
  let keys = datasetInfo.keys;
  let toDownloadSet = null;

  for(let i = 0; i < data.total_results; ++i) {
    const result = data.results[i];
    if (!validResult(result)) {
      continue;
    }

    const id = result.id;
    if (id in usedIds) {
      continue;
    }

    const taxon = result.taxon; // related default photo
    const iconic = taxon.name.toLowerCase();
    
    const photo = result.photos[0];
    const objID = uuid4();
    const fileName = `inat-${iconic}-${objID}`;

    if (photo.url in usedIds || usedIds.has(photo.url)) {
      continue;
    }

    usedIds.add(id);
    usedIds.add(photo.url);
    
    if (!(iconic in dataset)) {
      dataset[iconic] = []
      keys.push(iconic);
    } 

    dataset[iconic].push({
      url: photo.url,
      fileName,
      objID,
      category: iconic,
      categoryHint: iconic,
      attribution: photo.attribution,
      licenseCode: photo.license_code,
      id,
      photoID: photo.id,
      latitude: result.geojson.coordinates[0],
      longitude: result.geojson.coordinates[1]
    });

    // ordering can be very important here, and to do this correctly we would 
    // need to search through every possible combination till a valid combination
    // is found. Else, we'd have to get another photo and try again. There is
    // not an efficient and easy way to go about this. So we just select a 
    // configuration and try it, else we keep going. To do this, the array is
    // rotated
    //
    // > let a = [1,2,3,4,5]
    // > a.push(a.shift())
    // > a
    // [ 2, 3, 4, 5, 1 ]
    keys.push(keys.shift());

    toDownloadSet = getKeyToNumToDownload(dataset, keys);
    if(toDownloadSet !== null) {
      if (datasetInfo.index > 0) {
        pruneDataset(dataset, toDownloadSet);
        --datasetInfo.index;
      } else {
        // we've found a valid dataset
        break;
      }
    }
  }

  if (toDownloadSet === null) {
    callback(true);
		return;
  } else {
    let summaryData = {
      count: DATASET_SIZE*2,
      code: 'localdata',
      filenames: [],
      categoriesCount: 0,
      categoriesLabel: [],
      categoriesSample: [],
      tutorial: [],
      description: 'Become a citizen scientist and help label photographs of various animals near you, courtesy of iNaturalist.',
      short_description: 'Become a citizen scientist and help label photographs of various animals near you, courtesy of iNaturalist.',
      short_name_friendly: `${datasetInfo.state}_${datasetInfo.city}_v${datasetInfo.constIndex}`,
      has_location: 1,
      tutorial_explanations: [],
      is_inaturalist: 1
    };

    for(let key in toDownloadSet) {
      // handle tutorial. We're gurantted to have atleast two photos for this
      // category
      if (summaryData.length === 0) {
        summaryData.tutorial.push(dataset[key][0].fileName);
        summaryData.tutorial.push(dataset[key][1].fileName);
      }

      summaryData.categoriesSample.push(dataset[key][0].fileName)
      summaryData.filenames.push(dataset[key][0].fileName)
      summaryData.categoriesLabel.push(key)
      ++summaryData.categoriesCount;

      for(let j = 1; j < toDownloadSet[key] * 2; ++j) {
        summaryData.filenames.push(dataset[key][j].fileName);
        dataset[key][j].category = '_';
      }
    }

    fs.writeFile(path.join(dir, `Dataset-Info.json`), JSON.stringify(summaryData, null, 2), (err) => {
      if (err) {
        console.log(err);
				calback(true);
				return;
      }

      callback(false, toDownloadSet);
			return;
    });
  }
};

const _buildDataSet = (dir, datasetInfo,  callback) => {
  const licenseURL = Object.keys(acceptedLicenses).join('&2C');
  
  const requestBase = `https://api.inaturalist.org/v1/observations?identified=true&photos=true&per_page=200&geo=true&license=${licenseURL}`;
  const requestGrade = '&quality_grade=research'
  const requestLocation = `&lat=${datasetInfo.latitude}&lng=${datasetInfo.longitude}&radius=${datasetInfo.radius}`;

  const url = `${requestBase}${requestLocation}${requestGrade}`;
  axios.get(url)
    .then((response) => {
      processData(dir, response.data, datasetInfo, (error, downloadSet) => {
        if (error) {
          datasetInfo.radius *= 2;
          console.log(`increasing radius for ${datasetInfo.latitude}, ${datasetInfo.longitude} to ${datasetInfo.radius}`);
          _buildDataSet(dir, datasetInfo, callback);
        } else {
          callback(false, downloadSet);
					return;
        }
      })
    })
    .catch((err) => {
      console.log(`\n\n${url}\n\n`);
      console.log(err.stack);
			callback(true, 'Unknown error encountered. Contact admin.');
    });
};


exports.buildDataSet = (dataset, state, city, indexNotConverted, callback) => {
	const index = Number(indexNotConverted);
	if (isNaN(index)) {
		callback(true, 'Received index that was not a number. Contact admin.');
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
      const dir = `dataset/${dataset}_${state}_${city}_v${index}`;
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

          let datasetInfo = {
            latitude, 
            longitude,
            index,
            constIndex: index,
            state,
            city,
            dataset: {},
            keys: [],
            usedIds: new Set(),
            radius: 4
          };

          _buildDataSet(dir, datasetInfo, (error, downloadSet) => {
            if (error && downloadSet !== null) {
							fs.rmdirSync(dir, { recursive: true });
							Utility.destroyFileIfExists(lockFile);
              callback(error, 'Error creating dataset. Contact admin.');
            } else {
              callback(error, 'Dataset is being created.');
							
							// Create Dataset              
              const dataset = datasetInfo.dataset;
              for(let key in downloadSet) {
                for(let j = 0; j < downloadSet[key] * 2; ++j) {
                  download(dir, dataset[key][j]);
                }
              }
              
              // the problem is that this is synchronous and eating up all the 
              // other computation so I need to make this not synchronous and
              // then I'm good to go.
              const interval = setInterval(() => {
                let files = fs.readdirSync(dir);
                if (files.length >= DATASET_SIZE*2) {
                  let tempFilesExist = false;
                  files.forEach(file => {
                    if (file.includes('temp')) {
                      tempFilesExist = true;
                    }
                  });

                  if (!tempFilesExist) {
                    Utility.destroyFileIfExists(lockFile);
                    clearInterval(interval);
                  }
                }
              });

            }
          })
        }
      }
    }
  });
}
