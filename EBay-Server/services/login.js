var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";

function handle_request(msg, callback){
	
	var res = {};
	console.log("In handle request:"+ msg.username);
	
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('login');
		
		coll.findOne({
			"email": msg.username, "password":msg.password
		}, function(err, user){
			if(user != null){
				res.firstname = user.firstName;
				res.lastname = user.lastName;
				res.emailid = user.email;
				res.code = "200";
				res.value = "Success Login";
				console.log("user exists");
			}	
			else{
				console.log("user does not exist");
				//json_responses = {"statusCode" : 401};
//				res.send(json_responses);
				res.code = "401";
				res.value = "Failed Login";
			}
			callback(null, res);
		});
	});
}

function register(msg, callback){
	var firstName = msg.firstname;
	var lastName = msg.lastname;
	var email = msg.email;
	var password = msg.password;
	
	var res = {};
	console.log("In registration request:"+ msg.username);
	
	mongo.connect(mongoURL, function(){
		console.log('Inside registration');
		var coll = mongo.collection('login');
		coll.insert({
	    			"firstName": firstName,
	    			"lastName": lastName,
	    			"email": email,
	    			"password":password ,
	    		}, function(err, user){
	    			console.log("user3-- "+user.insertedIds);
	    			if(err){
	    				console.log("inside error" + err);
	    				res.code = "401";
	    				res.value = "Failed Login";
	    			}
	    			else
	    			{
	    				console.log("inside success");
	    				res.code = "200";
	    				res.value = "Success Login";
	    			}
	    			callback(null, res);
	    		});
	});
}

exports.handle_request = handle_request;
exports.register = register;