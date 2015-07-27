//*** express
var express = require('express');
var app = express();

//*** logger
var logger = require('morgan');
app.use(logger('dev'));

//*** path
var path = require('path');

//*** parsers
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//*** routers
var routes = require('./routes/index');
var users = require('./routes/users');

//*** mongoose
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/webhelp');

// var User = require("./models/user").LocalUser;

//*** passport
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;

//*** view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//*** sass
var sassMiddleware = require('node-sass-middleware')
app.use(
    sassMiddleware({
        //src: __dirname + '/public/sass',
        //dest: __dirname + '/public/css',
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        debug: true,
        outputStyle: 'compressed',
        prefix: '/prefix'
    })
);
  
var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/img/favicon.png'));


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
