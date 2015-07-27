//*** express
var express = require('express');
var app = express();

var expressSession = require('express-session');
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

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser());
app.use(cookieParser());

//*** routers
var routes = require('./routes/index');
var users = require('./routes/users');

//*** mongoose

var dbConfig = require('./db.js');
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

connect();

//var User = require("./models/user").LocalUser;

//*** passport
var passport = require('passport');
var expressSession = require('express-session');

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new LocalStrategy(function(username, password, done){
    User.LocalUser.findOne({ username: username},function(err,user){
        if (err) { return done(err); }
        if (!user){
            return done(null, false, { message: 'Incorrect username.' });
        }

        hash(password, user.salt, function (err, hash) {
            if (err) { return done(err); }
            if (hash == user.hash) return done(null, user);
            done(null, false, { message: 'Incorrect password.' });
        });
    });
}));

passport.use(new FacebookStrategy({
    clientID: "YOUR ID",
    clientSecret: "YOUR CODE",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
    User.FacebookUser.findOne({fbId : profile.id}, function(err, oldUser){
        if (oldUser){
            done(null,oldUser);
        } else {
            var newUser = new User.FacebookUser({
                fbId: profile.id ,
                email: profile.emails[0].value,
                name: profile.displayName
            }).save(function(err,newUser){
                if (err) throw err;
                done(null, newUser);
            });
        }
    });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    User.FacebookUser.findById(id,function(err,user){
        if (err) done(err);
        if (user) {
            done(null,user);
        } else {
            User.LocalUser.findById(id, function(err,user){
                if (err) done(err);
                done(null,user);
            });
        }
    });
});

app.use(passport.initialize());
app.use(passport.session());

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
/*
app.use(session({
    genid: function(req) {
        return genuuid() // use UUIDs for session IDs
    },
    secret: 'keyboard cat'
}))

function genuuid() {
    return 'aa';
}
*/
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
