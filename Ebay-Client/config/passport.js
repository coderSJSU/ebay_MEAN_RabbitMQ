var LocalStrategy   = require('passport-local').Strategy;

var mq_client = require('../rpc/client');
var winston = require('winston');

var myCustomLevels = {
	    levels: {
	      event: 0,
	      bid: 1
	    }
	  };
var logger = new (winston.Logger)({
    level: 'event', 
    levels: myCustomLevels.levels,
    transports: [new winston.transports.File({filename: 'F:/lib/event.log'})]
  }); 


module.exports = function(passport) {

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password,  done) {
        	console.log("inside local-login");
        	
        	var email_id = req.param("email");
        	var password = req.param("password");
        	
        	var msg_payload = { "email_id": email_id, "password": password };
        	var json_responses;	
        	console.log("In POST Request = email_id:"+ email_id+"-"+password);
        	
        	mq_client.make_request('login_queue',msg_payload, function(err,results){
        		
        		console.log(results);
        		if(err){
        			throw err;
        		}
        		else 
        		{
        			console.log("inside success");
        			if(results.code == 200){
        				console.log("valid Login");
        				req.session.first_nm = results.firstname;
        				req.session.last_nm = results.lastname;
        				req.session.email_id = results.emailid;
        				req.session.user_id = results.user_id;
        				req.session.last_ts = results.date;
        				req.session.last_ts = results.date;
        				console.log(req.session.last_ts + "  ");
        				console.log( "  " + results.date);
        				return done(null, "done");
        			}
        			else {    
        				json_responses = {"statusCode" : 402};
        				return done(null, "error");
        			}
        		}  
        	});
        })
    );
    
    passport.use(
            'local-signup',
            new LocalStrategy({
                usernameField : 'email',
                passwordField : 'password',
                passReqToCallback : true
            },
            function(req, username, password,  done) {
            	console.log("inside local-sign-up");
            	
            	var firstName = req.param("firstname");
        		var lastName = req.param("lastname");
        		var email = req.param("email");
        		var password = req.param("password");
        		console.log("new user registration firstName:" + firstName +"lastName:" +lastName+"email:" +email+"password:" +password);
        		logger.event("new user registration", { email: email, first_name: firstName});
        		
        		var tel = req.param("tel");
        		
        		var msg_payload = { "email": email, "password": password, "firstname": firstName, "lastname": lastName,"tel":tel};
            	
            	mq_client.make_request('register_queue',msg_payload, function(err,results){
        			
        			console.log(results);
        			if(err){
        				return done(null, "error");
        			}
        			else 
        			{
        				console.log("inside success results " + results);
        				if(results.statusCode == 200){
        					console.log("valid registration");
        					
        					req.session.last_ts = "";
            				req.session.user_id = results.user_id;
            				req.session.first_nm = results.first_nm ;
            				return done(null, "done");
        				}
        				else {    
        					return done(null, "error");
        				}
        			}  
        		});
            })
        );
};
