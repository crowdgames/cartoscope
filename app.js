var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('passport');
var users = require('./routes/users');
var login = require('./routes/login');
var projectsApi = require('./routes/projects');
var taskApi = require('./routes/tasks');
var session = require('express-session');
var anonApi = require('./routes/anonUser');
var results = require('./routes/results');

var featured = require('./routes/featured');
var d3 = require('d3');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());

// -----------------------------------------------------
app.use(session({
  secret: 'CoNvErGe',
  rolling: true,
  resave: true,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// @TODO Figure out best way to serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
// -----------------------------------------------------

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/user', users);
app.use('/api/project', projectsApi);
app.use('/api/', login);
app.use('/api/tasks', taskApi);
app.use('/api/anon', anonApi);

app.use('/api/featured', featured);

app.use('/api/test', require('./routes/test'));

// Results api, refers to heatmap results presently
app.use('/api/results', results);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
