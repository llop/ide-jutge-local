//------------------------------------------------------------------------------
// 
// give the process a 'title' so we can get an easy kill with npm-stop
// 
//------------------------------------------------------------------------------

process.title = 'ide-jutge-local';


//------------------------------------------------------------------------------
// 
// modules
// 
//------------------------------------------------------------------------------
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var fs = require('fs');
var workbenchController = require('./controllers/workbench/workbench-controller');


//------------------------------------------------------------------------------
// 
// socket.io setup
// http://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www
// 
//------------------------------------------------------------------------------
var app = express();
var io = socketio();
app.io = io;


//------------------------------------------------------------------------------
// 
// controllers
// 
//------------------------------------------------------------------------------
workbenchController(io);


//------------------------------------------------------------------------------
// 
// view engine setup
// 
//------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
// if we are gonna be using Angular, the double curly braces are gonna be a problem
// from now on, in html templates: <% var %> must be used instead of {{ title }} to write text
//                                 to write raw html, use <%{ title }%> instead of {{{ title }}}
app.locals.delimiters = '<% %>';


//------------------------------------------------------------------------------
// 
// routes
// 
//------------------------------------------------------------------------------
app.use(favicon(path.join(__dirname, 'public/img/ico', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'angular')));

// welcome page: this is a SPA!
app.use('/', require('./routes/index'));
app.use('/documentation', require('./routes/doc'));

// however, we may have more stuff under the hood :)



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
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
