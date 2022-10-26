/**
 * Created by kiprasad on 01/10/16.
 */

exports.requireLogin = function(req, res, next) {
  if (req.session && req.session.passport && req.session.passport.user) {
    next();
  } else {
    res.status(401).send({error: 'Not Authenticated'});
  }
};

exports.requireRegularLogin = function(req, res, next) {
  if (req.session && req.session.passport && req.session.passport.user && !req.session.passport.user.anonymous) {
    next();
  } else {
    res.status(401).send({error: 'Not Authenticated'});
  }
};

exports.requiredParamHandler = function(params) {
  return function(req, res, next) {
    var err = false;
    for (var i in params) {
      if (!(params[i] in req.body) && !(params[i] in req.params) && !(params[i] in req.query)) {
        err = true;
        res.status(400).send({'error': 'missing required param:' + params[i]});
        break;
      }
    }
    
    if (!err) {
      next();
    }
  };
};

exports.requiredBodyParamsHandler = (bodyParams) => {
  return (req, res, next) => {
    for (let param in bodyParams) {
      if (!param in req.body) {
        res.status(400).send({'error': 'missing required param:' + param});
        return;
      }
    }

    next();
  }
}

exports.requiredQueryParamsHandler = (queryParams) => {
  return (req, res, next) => {
    for (let param in queryParams) {
      if (!param in req.query) {
        res.status(400).send({'error': 'missing required param:' + param});
        return;
      }
    }

    next();
  }
}