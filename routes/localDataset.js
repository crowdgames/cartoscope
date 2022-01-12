'use strict';

module.exports = (() => {
  const inaturalist = require('../localDataset/inaturalist');
  const mapillary = require('../localDataset/mapillary');
  const Utility = require('../localDataset/Utility');
  const Constant = require('../localDataset/constants');
  const router = require('express').Router();

  const invalidDatasetMessage = 'Invalid dataset type requested.';

  router.post('/build/:dataset&:state&:city&:index', (req, res, next) => {
    const dataset = req.params.dataset;
    const state = req.params.state.toLowerCase();
    const city = req.params.city.toLowerCase();

    const callback = (error, message) => {
      res.status(error ? 400 : 200).send(message); 
    }
    
    switch(dataset) {
      case Constant.iNaturalist:
        inaturalist.buildDataSet(dataset, state, city, req.params.index, callback);
        break;
      case Constant.mapillary:
        mapillary.buildDataSet(dataset, state, city, req.params.index, callback);
        break;
      default:
        console.log(`${dataset} is invalid dataset.`);
        res.status(404).send(invalidDatasetMessage);
        break;
    }
  });

  router.get('/get/:dataset&:state&:city&:index', (req, res, next) => {
    const dataset = req.params.dataset;
    const state = req.params.state.toLowerCase();
    const city = req.params.city.toLowerCase();

    if (dataset !== Constant.iNaturalist && dataset !== Constant.mapillary) {
      res.status(404).send(invalidDatasetMessage);
    } else {
      const name = `${dataset}_${state}_${city}_v${req.params.index}`;
      const dir = `dataset`;
  
      Utility.zipAndSendDataSet(dir, name, 0, res);
    }
  });

  return router;
})();

