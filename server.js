// to add local user for UserSchema: uncomment lines 25 & 29,
// with the following lines, uncomment them and comment the lines above them: 39,68,70,90

// require node modules
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
var app = express();

// -------- set view engine to ejs
app.set('view engine','ejs');

// connect to mongo
mongoose.connect('mongodb://localhost/nodeAuthEncrypt');

// create user model
var Schema = mongoose.Schema;
var UserSchema = new Schema({
		username:{type:String},
		password:{type:String},
		created_at:{type: Date, default: Date.now}
});
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
var User = mongoose.model('User', UserSchema);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local-signup', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
},
function(req, username, password, done){
	process.nextTick(function(){
		User.findOne({'username': username}, function(err, user){
			if(err)
				return done(err);
			if(user){
				return done(null, false, req.flash('signupMessage', 'That name is already taken'));
			} else {
				var newUser = new User();
				newUser.username = username;
				newUser.password = newUser.generateHash(password);
				newUser.save(function(err){
					if(err)
						throw err;
					return done(null, newUser);
				})
			}
		})

	});
}));

passport.use('local-login', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
},
	function(req, username, password, done){
		process.nextTick(function(){
			User.findOne({ 'username': username}, function(err, user){
				if(err)
					return done(err);
				if(!user)
					return done(null, false, req.flash('loginMessage', 'User not found'));
				if(!user.validPassword(password)){
					return done(null, false, req.flash('loginMessage', 'Invalid username or password'));
				}
				return done(null, user);

			});
		});
	}
));

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
var errors; //if you don't declare errors here you will have issues with app.get('/')
	app.get('/',function(req,res){
		res.render('index',{errors:errors,message:req.flash('signupMessage')});
	});

	app.post('/register',function(req,res){
		req.check('username','A username is required').notEmpty();
		req.check('password','A password is required').notEmpty();
		errors = req.validationErrors();
		if(errors){
			res.render('index',{errors:errors,message:req.flash('signupMessage')});
			errors = []; // to clear the errors array
		}
		else{
			passport.authenticate('local-signup',{
			successRedirect: '/login',
			failureRedirect: '/',
			failureFlash: true
			})(req,res);
		}
	});

	app.get('/login',function(req,res){
		res.render('login',{errors:errors,message:req.flash('loginMessage')});
	});

	app.get('/success',isLoggedIn,function(req,res){
		res.render('success',{
			user:req.user
		});
	});

	app.post('/login', function(req,res){
		req.check('username','Please enter a username').notEmpty();
		req.check('password','Please enter your password').notEmpty();
		errors = req.validationErrors();
		if(errors){
			res.render('login',{errors:errors,message:req.flash('loginMessage')});
			errors = []; // to clear the errors array
		}
		else{
			passport.authenticate('local-login',{
			successRedirect: '/success',
		    failureRedirect: '/login',
		    failureFlash: true
			})(req,res);
		}
	});

	app.post('/logout',function(req,res){
			req.logout(); // this a built in function from passport.js
			res.redirect('login');
	});

	function isLoggedIn(req,res,next){
		if(req.isAuthenticated()){
			return next();
		}
		res.render('login');
	} // this function keeps anyone from accessing the '/success' page unless they are 
	// logged in
// ---------------------------------------------------------------------------

var port = process.env.PORT || 3000;
app.listen(port,function(){
	console.log("listening on port: "+port)
})

// ------------ Flash message information -------------------
// lines 64, 94, 96 in passport.use()
// lines 127, 143 in routes for 'post to regsiter' and post to login