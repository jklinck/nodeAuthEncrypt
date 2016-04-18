var passport = require('passport');

module.exports = function(app){

	app.get('/',function(req,res){
		res.render('index',{message:req.flash('signupMessage')});
	});

	app.post('/register',passport.authenticate('local-signup',{
			successRedirect: '/login',
			failureRedirect: '/',
			failureFlash: true
			})
	);

	// app.post('/register',function(req,res){
	// 	req.check('username','A username is required').notEmpty();
	// 	req.check('password','A password is required').notEmpty();
	// 	var errors = req.validationErrors();
	// 	console.log('errors check: ', errors);
	// 	if(errors){
	// 		res.render('index',{errors:req.flash(errors)});
	// 	}
	// 	else{
	// 		passport.authenticate('local-signup',{
	// 		successRedirect: '/login',
	// 		failureRedirect: '/',
	// 		failureFlash: true
	// 		});
	// 	}
	// });

	app.get('/login',function(req,res){
		res.render('login',{message:req.flash('loginMessage')});
	});

	app.get('/success',isLoggedIn,function(req,res){
		res.render('success',{
			user:req.user
		});
	});

	app.post('/login',passport.authenticate('local-login',{
		successRedirect: '/success',
	    failureRedirect: '/login',
	    failureFlash: true
	}));


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
