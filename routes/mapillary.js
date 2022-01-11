'use strict';

moduel.exports = (() => {
  const localDataset = require('../localDataset/mapillary');
  const utility = require('../localDataset/Utility');
  const router = require('express').Router();

  router.post('/buildLocalDataset/:state&:city&:index', (req, res, next) => {
    const state = req.params.state.toLowerCase();
    const city = req.params.city.toLowerCase();

    localDataset.buildDataSet(state, city, req.params.index, (error, message) => {
      res.status(error ? 400 : 200).send(message); 
    });
  });

  router.get('/getDataSet/:state&:city&:index', (req, res, next) => {
    const state = req.params.state.toLowerCase();
    const city = req.params.city.toLowerCase();

    const name = `mapillary_${state}_${city}_v${req.params.index}`;
    const dir = `dataset`;

    Utility.zipAndSendDataSet(dir, name, 0, res);
  });

  return router;
})();

