var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var port = process.env.PORT || 3000;
var app = express();

// -------- set view engine to ejs -----------------------
app.set('view engine','ejs');

// connect to mongo
mongoose.connect('mongodb://localhost/nodeAuthEncrypt');

require('./server/passport.js')(passport);

// Node modules configuration
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator()); // this MUST come after the bodyParser above
app.use(cookieParser());
app.use(expressSession({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: true,
	saveUninitialized: true
}));
// passport configuratioin below MUST come after the configurations above
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// ------------ ROUTES -----------------------------------------------------
require('./server/routes.js')(app,passport);
// ---------------------------------------------------------------------------

app.listen(port,function(){
	console.log("listening on port: "+port)
})
