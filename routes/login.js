/**
 * Created by kiprasad on 01/08/16.
 */
var express = require('express');
var userDB = require('../db/user');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var filters = require('../constants/filters');

passport.use('user', new LocalStrategy(function(username, password, done) {
    userDB.getUserWithPassword(username, password, function(err, result) {
      if (err) {
        done(err);
      } else {
        if (result) {
          done(null, result);
        } else {
          return done(null, false, {message: 'Incorrect username or password.'});
        }
      }
    });
  }
));

/**
 * Routes to login page where it sends the user object to the database for updating the last login information.
 */
router.post('/login', function(req, res, next) {
  passport.authenticate('user', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send({error: 'Incorrect username or password.'});
    }
    user.anonymous = false;
    req.logout();
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
      }
      userDB.setLastLogin(user.id);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(user));
    });
  })(req, res, next);
});

/**
 * Logs out the user.
 */
router.get('/logout', function(req, res, next) {
  req.logout();
  //res.redirect('/');
  res.send({});
});

module.exports = router;
