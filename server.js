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
var bcrypt = require('bcrypt');
var flash = require('connect-flash');
var app = express();

// -------- set view engine to ejs
app.set('view engine','ejs');

// connect to mongo
mongoose.connect('mongodb://localhost/nodeAuthEncrypt');

// create user model
var Schema = mongoose.Schema;
var UserSchema = new Schema({
	// local:{
		username:{type:String, required:true},
		password:{type:String, required:true},
		created_at:{type: Date, default: Date.now}
	// }
});
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
    // return bcrypt.compareSync(password, this.local.password); 
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
				return done(null, false, req.flash('signupMessage', 'That email already taken'));
			} else {
				var newUser = new User();
				newUser.username = username;
				// newUser.local.username = username;
				newUser.password = newUser.generateHash(password);
				// newUser.local.password = newUser.generateHash(password);
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
			// User.findOne({ 'local.username': username}, function(err, user){
				if(err)
					return done(err);
				if(!user)
					return done(null, false, req.flash('loginMessage', 'No User found'));
				if(!user.validPassword(password)){
					return done(null, false, req.flash('loginMessage', 'invalid password'));
				}
				return done(null, user);

			});
		});
	}
));

// Node modules configuration
app.use(bodyParser.urlencoded({extended:true}));
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
app.get('/',function(req,res){
	res.render('index');
});

app.post('/register',passport.authenticate('local-signup',{
	successRedirect: '/login',
	failureRedirect: '/index',
	failureFlash: true
}));

app.get('/login',function(req,res){
	res.render('login');
});

app.get('/success',function(req,res){
	res.render('success',{
		user:req.user
	});
});

app.post('/login',passport.authenticate('local-login',{
	successRedirect: '/success',
    failureRedirect: '/login',
    failureFlash:'Invalid username or password'
}));


app.post('/logout',function(req,res){
		req.logout();
		res.redirect('login');
});

// ---------------------------------------------------------------------------

var port = process.env.PORT || 3000;
app.listen(port,function(){
	console.log("listening on port: "+port)
})