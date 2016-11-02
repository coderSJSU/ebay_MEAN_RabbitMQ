var ejs = require("ejs");
var mysql = require('./mysql');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";
ObjectID = require('mongodb').ObjectID;
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

function getItemsForSale(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	var queryString = 'select p.prod_id , p.label, p.description, p.brand as brand_id,  ' + 
	'(select b.label from brand b where b.brand_id = p.brand)  brand, p.quantity '+ 
  ' from product p where p.seller_id =' + cust_id+ '';
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL );
			var coll = mongo.collection('product');
			coll.find({"seller_id":cust_id}).toArray(function(err, products){
				if(err){
					json_responses = {"statusCode" : 401};
					res.send(json_responses);
		    			}
    			else 
    			{
    				json_responses = {"statusCode" : 200, "data": products};
    				res.send(json_responses);
    			}
		    		});
		});
	}
}

function getItemsForSaleOld(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	var queryString = 'select p.prod_id , p.label, p.description, p.brand as brand_id,  ' + 
	'(select b.label from brand b where b.brand_id = p.brand)  brand, p.quantity '+ 
  ' from product p where p.seller_id =' + cust_id+ '';
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
	
	mysql.fetchData(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else 
{
	json_responses = {"statusCode" : 200, "data": results};
	res.send(json_responses);
}

},queryString,'');
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
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL );
			var coll = mongo.collection('sales');
			coll.find({"user_id":cust_id}).toArray(function(err, products){
				if(err){
					json_responses = {"statusCode" : 401};
					res.send(json_responses);
		    			}
    			else 
    			{
    				json_responses = {"statusCode" : 200, "data": products};
    				res.send(json_responses);
    			}
    		});
		});
	}
}


function getItemsBoughtOld(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	var queryString = 'select s.product_id , p.label, p.brand as brand_id,  ' +
		' (select b.label from datahub.brand b where b.brand_id = p.brand)  brand, s.quantity ' + 
		' from datahub.product p, datahub.sales s where s.product_id = p.prod_id and s.customer_id =' + cust_id+ '';	
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
	
	mysql.fetchData(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else 
{
	json_responses = {"statusCode" : 200, "data": results};
	res.send(json_responses);
}

},queryString,'');
	}
}

function getUserInfo(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	var queryString = 'SELECT c.first_nm, c.last_nm, c.email_id, c.month, c.day, c.year, ca.address, ca.city, ca.country ' +
		' FROM customer c left join customer_add ca on ca.customer_id = c.cust_id where c.cust_id =' + cust_id+ '';	
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL + " cust_id: " + cust_id);
			var obj_id = new ObjectID(cust_id);
			console.log("obj_id: " + obj_id);
			var coll = mongo.collection('login');
			coll.findOne({"_id":obj_id}, function(err, user){
				if(err){
					json_responses = {"statusCode" : 401};
					res.send(json_responses);
		    			}
				else if(user != null)
	    			{
					json_responses = {"statusCode" : 200, "data": user};
					res.send(json_responses);
		    			}
				else{
					json_responses = {"statusCode" : 401};
					res.send(json_responses);
				}
		    		});
		});		
	}
}

function getUserInfoOld(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	var queryString = 'SELECT c.first_nm, c.last_nm, c.email_id, c.month, c.day, c.year, ca.address, ca.city, ca.country ' +
		' FROM customer c left join customer_add ca on ca.customer_id = c.cust_id where c.cust_id =' + cust_id+ '';	
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
	
	mysql.fetchData(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else 
{
	json_responses = {"statusCode" : 200, "data": results};
	res.send(json_responses);
}

},queryString,'');
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
	var obj_id = new ObjectID(cust_id);
	console.log("obj_id: " + obj_id);
	var post  = {day: day, year : year, address: address, city: city, country:country,month:month};
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('login');
				coll.update({"_id" :obj_id},{$set:{
					"first_nm": first_nm,
					"last_nm": last_nm,
					"email_id": email_id,
					"month":month ,
					"day": day,
					"year": year,
					"address":address,
					"city":city,
					"country":country}
				}, function(err, user){
					console.log("user -- "+user.insertedIds);
					var json_responses;
					if(err){
						json_responses = {"statusCode" : 203};
						res.send(json_responses);
					}
					else
					{
						logger.event("profile updated", { user: cust_id});
						json_responses = {"statusCode" : 200};
						res.send(json_responses);
					}
				});
	}); 
}


function saveProfileOld(req,res)
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
	
	var post  = {day: day, year : year, address: address, city: city, country:country,month:month};
	
	
	var updateCust='update customer set month = ? , year = ? ' +
		', day = ? where cust_id = '+cust_id;
		mysql.insertqueryWithParams(function(err,results){
		if(err){
			cust_updated = 0;
		throw err;
		}
		else{
			cust_updated = 1;
		}
		},updateCust, [month, year, day]);
		
		var updateCustAdd='update customer_add set address = ? , city = ? , country = ?  where customer_id = '+cust_id;
		mysql.insertqueryWithParams(function(err,results){
		if(err){
			add_updated = 0;
			throw err;
		}
		else{
			add_updated = 1;
			if(add_updated ==1){
				logger.event("profile updated", { user: cust_id});
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}
			else{
				json_responses = {"statusCode" : 203};
				res.send(json_responses);
			}
			
			
		}
		},updateCustAdd, [address, city, country]);	
}


exports.getItemsForSale = getItemsForSale;
exports.getItemsBought = getItemsBought;
exports.getUserInfo = getUserInfo;
exports.saveProfile = saveProfile;