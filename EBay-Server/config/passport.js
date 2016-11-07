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
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, username, password,  done) {
        	var email_id = req.param("email");
        	var password = req.param("password");
        	var msg_payload = { "email_id": email_id, "password": password };
        	var json_responses;	
        	mq_client.make_request('login_queue',msg_payload, function(err,results){
        		if(err){
        			throw err;
        		}
        		else 
        		{
        			if(results.code == 200){
        				req.session.first_nm = results.firstname;
        				req.session.last_nm = results.lastname;
        				req.session.email_id = results.emailid;
        				req.session.user_id = results.user_id;
        				req.session.last_ts = results.date;
        				req.session.last_ts = results.date;
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
            	
            	var firstName = req.param("firstname");
        		var lastName = req.param("lastname");
        		var email = req.param("email");
        		var password = req.param("password");
        		logger.event("new user registration", { email: email, first_name: firstName});
        		
        		var tel = req.param("tel");
        		
        		var msg_payload = { "email": email, "password": password, "firstname": firstName, "lastname": lastName,"tel":tel};
            	
            	mq_client.make_request('register_queue',msg_payload, function(err,results){
        			
        			if(err){
        				return done(null, "error");
        			}
        			else 
        			{
        				if(results.statusCode == 200){
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
