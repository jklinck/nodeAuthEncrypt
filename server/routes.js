var passport = require('passport');

module.exports = function(app){
	var errors;
	app.get('/',function(req,res){
		res.render('index',{errors:errors,message:req.flash('signupMessage')});
	});

	app.post('/register',function(req,res){
		req.check('username','A username is required').notEmpty();
		req.check('password','A password is required').notEmpty();
		errors = req.validationErrors();
		if(errors){
			res.render('index',{errors:errors,message:req.flash('signupMessage')});
			errors = [];
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
			errors = [];
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
			req.logout();
			res.redirect('login');
	});

	function isLoggedIn(req,res,next){
		if(req.isAuthenticated()){
			return next();
		}
		res.render('login');
	}
}
