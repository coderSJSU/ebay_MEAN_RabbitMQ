// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var bcrypt = require('bcrypt-nodejs');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://localhost:27017/test";

module.exports = function(passport) {

       passport.serializeUser(function(user, done) {
    	console.log("serializeUser-- "+ user);
        done(null, "done");
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
    	console.log("derializeUser---" +id);
            done(null, "done");
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password,  done) {
        	console.log("inside local-sign-up");
        	mongo.connect(mongoURL, function(){
        		console.log('Connected too mongo at: ' + mongoURL + "name: " + req.body.name);
        		var coll = mongo.collection('login');
        		
        		coll.insert({
        			"email": username,
        			"name": req.body.name,
        			"password":bcrypt.hashSync(password, null, null) 
        		}, function(err, user){
        			console.log("user-- "+user);
        			console.log("user2-- "+user._id);
        			console.log("user1-- "+user["_id"]);
        			console.log("user3-- "+user.insertedIds);
        			if (err) {
        				console.log("returned false");
        				return(done(err));

        			} else {
        				console.log("done");
        				return done(null, "done");
        			}
        		});
        	});       
        })
    );
    
    
    passport.use(
            'local-login',
            new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) {
            	console.log("inside local-sign-up");
            	req.session.email = "";
            	console.log("username-- " +username);
            	console.log(bcrypt.compareSync(password, "$2a$10$470xvD4nnexfpexql9zX9eG2vZNrctIqGF9NirzBNK8znMGVvpHrm"))
            	mongo.connect(mongoURL, function(){
            		console.log('Connected too mongo at: ' + mongoURL);
            		var coll = mongo.collection('login');
            		
            		coll.findOne({
            			"email": username
            		}, function(err, user){
            			console.log("user--" +user);
            			if (user) {
            				if (bcrypt.compareSync(password, user.password)){
            					req.session.email = user.email;
            					console.log("done");
                				return done(null, "done");
            				}
            				else{
            					console.log("returned false");
                				return(done(err));

            				}
            			} else {
            				console.log("returned false");
            				return(done(err));

            			}
            		});
            	});       
            })
        );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

};
