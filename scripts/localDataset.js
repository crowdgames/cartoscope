'use strict';

const readline = require('readline');
const fs = require('fs');

const axios = require('axios');
const path = require('path');
const uuid4 = require('uuid4');
const sharp = require('sharp');
const { url } = require('inspector');

const DATASET_SIZE = 12; // @TODO: configurable via url?

const acceptedLicenses = {
  'cc0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-nc': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-nc-sa': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}

/**
 * Read from csv of US cities to find latitude and longitude. 
 * @param {string} state 
 * @param {string} city 
 * @param {function} callback 
 */
const validateUserInput = (state, city, callback) => {
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
      } 
    })
    .on('line', (line) => {
      const split = line.split(',');
      const newState = split[1].toLowerCase();
      const newCity = split[3].replace(/['"]+/g, '').toLowerCase();

      if (newState === state && newCity === city) {
        found = true;
        readInterface.close(); // stop extra processing and error message being sent
        callback(false, parseFloat(split[5]), parseFloat(split[6]));
      }
    });
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
          fs.unlink(photoSaveNameTemp, () => {});
        });
    });

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
    };

    // encoding is defaulted to utf-8
    fs.writeFile(path.join(dir, `${info.fileName}.json`), JSON.stringify(meta, null, 2), (err) => {
      if (err) {
        console.log(err);
      }
    });
  })
  .catch((err) => {
    console.log(err);
    console.log(info);
    process.exit(-1);
  });
};

const validResult = (result) => {
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
}

const processData = (dir, data, dataset, usedIds, summaryData, callback) => {
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
    } else if (dataset[iconic].length >= 2) {
      continue;
    } 

    dataset[iconic].push({
      url: photo.url,
      fileName,
      objID,
      category: '_',
      categoryHint: iconic,
      attribution: photo.attribution,
      licenseCode: photo.license_code,
      id,
      photoID: photo.id,
      latitude: result.geojson.coordinates[0],
      longitude: result.geojson.coordinates[1]
    });

    if (dataset[iconic].length == 2) {
      ++summaryData.categoriesCount;
      summaryData.categoriesLabel.push(iconic);
      summaryData.categoriesSample.push(fileName);

      summaryData.filenames.push(dataset[iconic][0].fileName);
      summaryData.filenames.push(fileName);

      if (summaryData.tutorial.length === 0) {
        summaryData.tutorial.push(dataset[iconic][0].fileName);
        summaryData.tutorial.push(fileName);
      }
    }
    
    if (summaryData.filenames.length - summaryData.categoriesSample.length >= DATASET_SIZE) {
      break;
    }
  }

  if (summaryData.filenames.length - summaryData.categoriesSample.length < DATASET_SIZE) {
    callback(true);
  } else {
    for (const entry of Object.entries(dataset)) {
      if (entry[1].length === 2) {
        download(dir, entry[1][0]);
        download(dir, entry[1][1]);
      }
    }

    fs.writeFile(path.join(dir, `Dataset-Info.json`), JSON.stringify(summaryData, null, 2), (err) => {
      if (err) {
        console.log(err);
      }

      callback(false);
    });
  }
};

const buildDataSet = (dir, latitude, longitude, dataset, usedIds, summaryData, radius, callback) => {
  const licenseURL = Object.keys(acceptedLicenses).join('&2C');
  
  const requestBase = `https://api.inaturalist.org/v1/observations?identified=true&photos=true&per_page=200&geo=true&license=${licenseURL}`;
  const requestGrade = '&quality_grade=research'
  const requestLocation = `&lat=${latitude}&lng=${longitude}&radius=${radius}`;
  
  const url = `${requestBase}${requestLocation}${requestGrade}`;
  axios.get(url)
    .then((response) => {
      processData(dir, response.data, dataset, usedIds, summaryData, (error) => {
        if (error) {
          radius *= 2;
          console.log(`increasing radius for ${latitude}, ${longitude} to ${radius}`);
          buildDataSet(dir, latitude, longitude, dataset, usedIds, summaryData, radius, callback);
        } else {
          callback(false);
        }
      })
    })
    .catch((err) => {
      console.log(`\n\n${url}\n\n`);
      console.log(`Error: ${err}`);
    });
};

exports.buildDataSet = (state, city, index, callback) => {
  console.warn('index not being used by create dataset');
  validateUserInput(state, city, (error, latitude, longitude) => {
    if (error) {
      callback(false, 'Invalid city or state or both.');
    } else {
      // If the driectory already exists than we can tell the caller that the dataset has been made
      // which we singify with no error being found. otherwise, we make a temp file to tell any
      // other calls that we are in the process of making the dataset. 
      const dir = `dataset/location_${state}_${city}_v${index}`;
      if (fs.existsSync(dir)) {
        callback(false, 'Dataset already exists.');
      } else {
        const lockFile = `${dir}.temp`;
        if (fs.existsSync(lockFile)) {
          callback(false, 'Dataset is being made.');
        } else {
          fs.closeSync(fs.openSync(lockFile, 'w'));
          fs.mkdirSync(dir);

          let summaryData = {
            count: DATASET_SIZE,
            code: 'localdata',
            filenames: [],
            categoriesCount: 0,
            categoriesLabel: [],
            categoriesSample: [],
            tutorial: [],
            description: 'Become a citizen scientist and help label photographs of various animals near you, courtesy of iNaturalist.',
            short_description: 'Become a citizen scientist and help label photographs of various animals near you, courtesy of iNaturalist.',
            short_name_friendly: `${state}_${city}_v${index}`,
            has_location: 1,
            tutorial_explanations: []
          };

          buildDataSet(dir, latitude, longitude, {}, new Set(), summaryData, 2, (error) => {
            if (error) {
              callback(error, 'Error creating dataset. Contact admin.');
            } else {
              callback(error, 'Dataset created!')
            }

            // handle destruction of lockfile
            fs.exists(lockFile, (exists) => {
              if (exists) {
                fs.unlink(lockFile, (err) => {
                  if (err) {
                    console.log(`Unable to delete lockfile: ${lockFile}`);
                    console.log(err);
                  } else {
                    console.log(`Deleted lockfile: ${lockFile}`);
                  }
                });
              } else {
                console.log(`${lockFile} already destroyed.`);
              }
            });
          });
        }
      }
    }
  });
}
