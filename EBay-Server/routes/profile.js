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

function getItemsForSale(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var msg_payload = {"seller_id":cust_id};
		mq_client.make_request('forSale_queue',msg_payload, function(err,results){
			console.log(results.products);
			console.log("inside success");
			if(results.statusCode == "200"){
				json_responses = {"statusCode" : 200, "data": results.products};
				res.send(json_responses);
			}
			else {    
				json_responses = {"statusCode" : results.statusCode};
				res.send(json_responses);
			}  
		});
	}
}

function getItemsBought(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var msg_payload = {"cust_id":cust_id};
		mq_client.make_request('bought_queue',msg_payload, function(err,results){
			
			console.log(results.products);
			if(err){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else 
			{
				console.log("inside getItemsBought success");
				if(results.statusCode == "200"){
					json_responses = {"statusCode" : 200, "data": results.products};
    				res.send(json_responses);
				}
				else {    
					json_responses = {"statusCode" : results.statusCode};
					res.send(json_responses);
				}
			}  
		});
	}
}

function getUserInfo(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		
		var msg_payload = { "cust_id": cust_id};
		mq_client.make_request('userInfo_queue',msg_payload, function(err,results){
		console.log(results);
		console.log("inside userInfo_queue success");
		if(results.statusCode == "200"){
			console.log("got user info");
			
			json_responses = {"statusCode" : 200, "data": results.user};
			res.send(json_responses);
		}
		else {    
			json_responses = {"statusCode" : results.statusCode};
			res.send(json_responses);
		}
		});
	}
}

function saveProfile(req,res)
{
	var cust_id = req.session.user_id;
	var cust_updated = 0;
	var add_updated = 0;
	var month = req.param("month");
	var year = req.param("year");
	var day = req.param("day");
	var address = req.param("address");
	var city = req.param("city");
	var country = req.param("country");
	var first_nm = req.param("first_nm");
	var	last_nm = req.param("last_nm");
	var email_id = req.param("email_id");
	var msg_payload = { "cust_id":cust_id, "first_nm": first_nm,
			"last_nm": last_nm,
			"email_id": email_id,
			"month":month ,
			"day": day,
			"year": year,
			"address":address,
			"city":city,
			"country":country};
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		mq_client.make_request('saveProfile_queue',msg_payload, function(err,results){
			
			console.log(results);
			var json_responses;
			if(results.statusCode != "200"){
				json_responses = {"statusCode" : results.statusCode};
				res.send(json_responses);
			}
			else
			{
				logger.event("profile updated", { user: cust_id});
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}
		});
	}
	
}

exports.getItemsForSale = getItemsForSale;
exports.getItemsBought = getItemsBought;
exports.getUserInfo = getUserInfo;
exports.saveProfile = saveProfile;