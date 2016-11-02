var ejs = require("ejs");
var mysql = require('./mysql');
var crypto = require('crypto');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";
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

var bidLogger = new (winston.Logger)({
    level: 'bid', 
    levels: myCustomLevels.levels,
    transports: [new winston.transports.File({filename: 'F:/lib/bidding.log'})]
  }); 

/*
 * GET users listing.
 */

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

	function register(msg, callback)
	{
		var firstName = msg.firstname;
		var lastName = msg.lastname;
		var email = msg.email;
		var password = msg.password;
		logger.event("new user registration", { email: email, first_name: firstName});
		
		password = encrypt(password);
		var json_responses;
		var tel = msg.tel;
		var res = {};
		var post  = {first_nm: firstName, last_nm : lastName, email_id: email, pass: password, tel:tel };
		logger.event("new user registration", { email: email, first_name: firstName});
		mongo.connect(mongoURL, function(){
    		console.log('Connected too mongo at: ' + mongoURL + "name: " + msg.firstname);
    		var coll = mongo.collection('login');
    		coll.findOne({
    			"email": email
    		}, function(err, user){
    			if(user != null){
    				console.log("user exists");
    				res.statusCode ="401";
					//res.send(json_responses);
    			}	
    			else{	
		    		coll.insert({
		    			"firstName": firstName,
		    			"lastName": lastName,
		    			"email": email,
		    			"password":password ,
		    			"tel": tel
		    		}, function(err, user){
		    			console.log("user3-- "+user.insertedIds);
		    			if(err){
		    				res.statusCode ="402";
		    			}
		    			else
		    			{
		    				//req.session.last_ts = "";
		    				res.user_id = user.insertedIds,
		    				res.first_nm = firstName ;
		    				res.statusCode ="200";
		    			}
		    		});
    			}
    			callback(null, res);
    		});
    	});       
		
	}	
	
function registerOld(req,res)
{
	var firstName = req.param("firstname");
	var lastName = req.param("lastname");
	var email = req.param("email");
	var password = req.param("password");
	logger.event("new user registration", { email: email, first_name: firstName});
	
	password = encrypt(password);
	var json_responses;
	var tel = req.param("tel");
	
	var post  = {first_nm: firstName, last_nm : lastName, email_id: email, pass: password, tel:tel };
	var insertUser="insert into customer set first_nm =? , last_nm =? , email_id = ?, pass = ?, tel = ?, last_login_ts = CURRENT_TIMESTAMP";
	mysql.insertqueryWithParams(function(err,results){
		if(err){
			if(err.code == "ER_DUP_ENTRY"){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else{
				json_responses = {"statusCode" : 402};
				res.send(json_responses);
			}
		}
		else
		{
			req.session.last_ts = "";
			req.session.user_id = results.insertId;
			req.session.first_nm = firstName ;
			json_responses = {"statusCode" : 200};
			res.send(json_responses);
		}
	},insertUser, [firstName, lastName, email, password, tel ]);
}

function checkUser(msg, callback){
	var email_id = msg.email;
	var password = msg.password;
	var res = {};
	console.log("In checkuser:"+ msg.email_id);
	password = encrypt(password);
	
	var json_responses;
//	var queryString = 'SELECT cust_id, first_nm, DATE_FORMAT(last_login_ts,\'%b %d %Y %h:%i %p\') as date  FROM datahub.customer WHERE email_id = ? and pass = ? ';

	mongo.connect(mongoURL, function(){
		//console.log('Connected too mongo at: ' + mongoURL + "name: " + req.body.name);
		var coll = mongo.collection('login');
		coll.findOne({
			"email": email_id, "password":password
		}, function(err, user){
			console.log(user);
			if(user != null){
				res.firstname = user.firstName;
				res.lastname = user.lastName;
				res.emailid = user.email;
				res.user_id = user._id,
				res.last_ts = user.last_ts,
				res.value = "Success Login";
				res.code = "200";
				console.log("user exists");
				//req.session.user_id = user._id;
				//req.session.first_nm = user.firstName;
				//req.session.last_ts = user.date;
				///console.log("inside : "+ req.session.user_id);
	    		coll.save({
	    			"user_id": user._id,
	    			"firstName": user.firstName,
	    			"lastName": user.lastName,
	    			"email": user.email,
	    			"password":user.password ,
	    			"tel": user.tel,
	    			"date":new Date()
	    		}, function(err, user){
	    			if(err){
	    					res.value = "error";
	    					res.code = "402";
	    			}
	    			else
	    			{
	    			}
	    			callback(null, res);
	    		});
			}	
			else{
				res.value ="no user";
				res.code = "402";
				callback(null, res);
			}
		});
	});
}


function checkUserOld(req, res){
	var email_id = req.param("email");
	var password = req.param("password");
	
	password = encrypt(password);
	
	var json_responses;
	var queryString = 'SELECT cust_id, first_nm, DATE_FORMAT(last_login_ts,\'%b %d %Y %h:%i %p\') as date  FROM datahub.customer WHERE email_id = ? and pass = ? ';

	mysql.insertqueryWithParams(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else if(results.length>0)
{	
	req.session.user_id = results[0].cust_id;
	req.session.first_nm = results[0].first_nm;
	req.session.last_ts = results[0].date;
	var queryString = 'Update datahub.customer set last_login_ts = CURRENT_TIMESTAMP WHERE cust_id = ' + req.session.user_id +'';
	mysql.updateData(queryString, "");
	logger.event("user logged in", { user_id: req.session.user_id});
	json_responses = {"statusCode" : 200};
	res.send(json_responses);

}
else if(results.length == 0)
{	
		json_responses = {"statusCode" : 402};
		res.send(json_responses);

}
},queryString, [email_id, password]);
}

function fetchData(callback,sqlQuery,key){
	var connection=mysql.getConnection();
	connection.query(sqlQuery, [key], function(err, rows, fields) {
	if(err){
	console.log("ERROR: " + err.message);
	}
	else
	{ // return err or result
	callback(err, rows);
	}
	});
	console.log("\nConnection closed..");
	connection.end();
	}

function encrypt(text){
	var algorithm = 'aes-256-ctr';
	var password = 'd6F3Efeq';
	
	var cipher = crypto.createCipher(algorithm,password)
	  var crypted = cipher.update(text,'utf8','hex')
	  crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text){
		var algorithm = 'aes-256-ctr';
		var password = 'd6F3Efeq';
		
	  var decipher = crypto.createDecipher(algorithm,password)
	  var dec = decipher.update(text,'hex','utf8')
	  dec += decipher.final('utf8');
	  return dec;
	}


exports.checkUser = checkUser;
exports.register=register;