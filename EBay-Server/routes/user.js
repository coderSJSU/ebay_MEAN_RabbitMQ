var ejs = require("ejs");
var winston = require('winston');
var mq_client = require('../rpc/client');

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

var bidLogger = new (winston.Logger)({
    level: 'bid', 
    levels: myCustomLevels.levels,
    transports: [new winston.transports.File({filename: 'F:/lib/bidding.log'})]
  }); 


exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.signOut = function(req, res){
	logger.event("user logged out", { user_id: req.session.user_id});	
	req.session.destroy();
	res.render('signin',function(err, result) {
		// render on success
		if (!err) {
		res.end(result);
		}
		// render or error
		else {
		res.end('An error occurred');
		console.log(err);
		}
		});
};

exports.loggedIn = function(req, res){
	if(req.session.user_id){
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		console.log("asdssd" + req.session.last_ts);
	res.render('index', { title: 'EBay', username:req.session.first_nm, last_ts: req.session.last_ts },function(err, result) {
	if (!err) {
		res.end(result);
		}
		else {
		res.end('An error occurred');
		console.log(err);
		}
		});
	}
	else{
		res.render('signin',function(err, result) {
			// render on success
			if (!err) {
			res.end(result);
			}
			// render or error
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
	}
	};

	function register(req,res)
	{
		var firstName = req.param("firstname");
		var lastName = req.param("lastname");
		var email = req.param("email");
		var password = req.param("password");
		logger.event("new user registration", { email: email, first_name: firstName});
		
		var json_responses;
		var tel = req.param("tel");
		
		var post  = {first_nm: firstName, last_nm : lastName, email_id: email, pass: password, tel:tel };
		logger.event("new user registration", { email: email, first_name: firstName});
		var msg_payload = { "email": email, "password": password, "firstname": firstName, "lastname": lastName,"tel":tel};
		mq_client.make_request('register_queue',msg_payload, function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				console.log("inside success results " + results);
				if(results.statusCode == 200){
					console.log("valid registration");
					
					req.session.last_ts = "";
    				req.session.user_id = results.user_id;
    				req.session.first_nm = results.first_nm ;
					json_responses = {"statusCode" : 200};
					res.send(json_responses);
					//res.send({"login":"Success"});
				}
				else {    
					json_responses = {"statusCode" : 402};
					res.send(json_responses);
				}
			}  
		});
	}	
	

function checkUser(req, res){
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
			console.log("inside success");
			if(results.code == 200){
				console.log("valid Login");
				
				req.session.first_nm = results.firstname;
				req.session.last_nm = results.lastname;
				req.session.email_id = results.emailid;
				req.session.user_id = results.user_id;
				req.session.last_ts = results.date;
				console.log(req.session.last_ts + "  ");
				console.log( "  " + results.date);
				console.log("valid Login2");
				//logger.event("user logged in", { user_id: req.session.user_id});
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
				//res.send({"login":"Success"});
			}
			else {    
				json_responses = {"statusCode" : 402};
				res.send(json_responses);
			}
		}  
	});
	
	
}


exports.checkUser = checkUser;
exports.register=register;