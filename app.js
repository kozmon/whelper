//*** express
var express = require('express');
var app = express();

var session = require('express-session');
//var bson = require('../browser_build/bson');

/*
app.use(expressSession({
    secret: cookie_secret,
    name: cookie_name,
    store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(expressSession({secret: 'mySecretKey'}));
*/
//*** logger
var morgan = require('morgan');
app.use(morgan('dev'));

//*** path
var path = require('path');

//*** parsers
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());

//*** passport
var passport = require('passport');
var flash    = require('connect-flash');

require('./config/passport')(passport);
app.use(session({ 
    secret: 'webhelpsecrettoken' ,
    resave: true,
    saveUninitialized: true    
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//*** routers
var routes = require('./routes/index')(app, passport);
var users = require('./routes/users');

//*** mongoose
var dbConfig = require('./config/db.js');
var mongoose = require('mongoose');
var connect = function () {
    var options = {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    };
    mongoose.connect(dbConfig.url, options);
};

//connect();

//*** view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//*** sass
var sassMiddleware = require('node-sass-middleware')
app.use(
    sassMiddleware({
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
//app.use('/', routes);
//app.use('/users', users);

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
