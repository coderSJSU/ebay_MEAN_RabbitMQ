var ejs = require("ejs");
var winston = require('winston');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";
ObjectID = require('mongodb').ObjectID;
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

function addBid(req, res){
	
	// check user already exists
	var amount = req.param("amount");
	var prodId = req.param("prodId");
	var user_id = req.session.user_id;
	var json_responses;
	if(user_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var msg_payload = { "amount": amount, "prodId": prodId, "user_id": user_id};
		mq_client.make_request('add_bid_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				console.log("error: " + JSON.stringify(err));
				json_responses = {"statusCode" : 405};
				res.send(json_responses);
			}
			else 
			{
				console.log("inside success");
				if(results.statusCode == 200){
					console.log("bid submitted");
					bidLogger.bid("bid submitted",{ user: user_id, product_id: prodId, amount: amount});
					json_responses = {"statusCode" : 200};
    				res.send(json_responses);
				}
				else {    
					json_responses = {"statusCode" : 402};
					res.send(json_responses);
				}
			}  
		});
	}
}

function addToCart(req, res){
	
	// check user already exists
	var data = req.param("data");
	var finalData = JSON.parse(data);
	var user_id = req.session.user_id;
	
	var json_responses;
	if(user_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		
		var msg_payload = {"product_id":finalData.id, 
    			"user_id": user_id, 
    			"brand": finalData.brand,
    			"quantity": finalData.quantity,
    			"label": finalData.label,
    			"price": finalData.price,
    			"condition": finalData.condition,
    			"deliveryPrice": finalData.deliveryPrice};
		mq_client.make_request('addToCart_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				console.log("inside success");
				if(results.statusCode == 200){
					console.log("added to cart");
					logger.event("added to cart", { user: user_id, product: finalData.id});	
    				json_responses = {"statusCode" : 200};
					res.send(json_responses);
				}
				else {    
					json_responses = {"statusCode" : 401};
    				res.send(json_responses);
				}
			}  
		});
	}
}


function getCart(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var msg_payload = { "user_id": cust_id};
		mq_client.make_request('getCart_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				console.log("inside success");
				if(results.statusCode == 200){
					console.log("got cart details");
					json_responses = {"statusCode" : 200, "data": results.products};
					res.send(json_responses);
					//res.send({"login":"Success"});
				}
				else {    
					json_responses = {"statusCode" : 401};
					res.send(json_responses);	
				}
			}  
		});
	}
}


function getCartAmount(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var msg_payload = {"user_id":cust_id};
		mq_client.make_request('cartAmount_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(results.statusCode == "401"){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else 
			{
				console.log("inside getCartAmount success");
				json_responses = {"statusCode" : 200, "data": results.products};
				res.send(json_responses);
			}  
		});
	}
}

function removeFromCart(req, res){
	var user_id = req.session.user_id;
	var json_responses;
	var cart_id = req.param("cart_id");
	var json_responses;
	if(user_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var obj_id = new ObjectID(cart_id);
		console.log("obj_id: " + obj_id);
		var msg_payload = { "cart_id": cart_id};
		mq_client.make_request('removeFromCart_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(results.statusCode != "200"){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else 
			{
				logger.event("removed to cart", { user: user_id});
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}
		});
	}
}

function payment1(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	var total = req.param("total");
	req.session.total = total;
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else {
		json_responses = {"statusCode" : 202};
		res.send(json_responses);
}
}

function emptyCart(req, res){
	var user_id = req.session.user_id;
	var json_responses;
	mongo.connect(mongoURL, function(){
	var coll = mongo.collection('cart');
		var obj_id = new ObjectID(user_id);
		console.log("obj_id: " + obj_id);
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL );
			var coll = mongo.collection('cart');
			coll.find({"user_id": user_id}).forEach(function(cart, err){
				if(err){
					console.log("error: " + JSON.stringify(err));
					json_responses = {"statusCode" : 405};
					res.send(json_responses);
	    			}
	    			else
	    			{
	    				var coll2 = mongo.collection('sales');
	    				coll2.insert(cart);
	    				
	    				var product = mongo.collection('product');
	    				var product_id = cart.product_id
	    				var obj_id = new ObjectID(product_id);
	    				console.log("cart: " + cart);
	    				
	    				product.find({"_id": obj_id}).forEach(function(prod, err){
	    					if(err){
	    						console.log("error: " + JSON.stringify(err));
	    						json_responses = {"statusCode" : 405};
	    						res.send(json_responses);
	    		    			}
	    		    			else
	    		    			{
	    		    				product.update({"_id":obj_id},
	    		    				{$set: {quantity: parseInt(prod.quantity)-cart.quantity}}		
	    		    				);
	    		    			}
	    			    		});
	    				
	    			}
		    		});
			coll.remove({"user_id": user_id}, function(err, cart){
				if(err){
					json_responses = {"statusCode" : 405};
					res.send(json_responses);
		    			}
				else
					{
						console.log("done");
	    				logger.event("empty cart", { user: user_id});
	    				json_responses = {"statusCode" : 200};
	    				res.send(json_responses);
	    			}
				});
		});
	});
}

exports.getProductQuanity = function(req, res){
	var data = req.param("data");
	var finalData = JSON.parse(data);
	var msg_payload = { "prod_id": finalData.prod_id};
	mq_client.make_request('productQuantity_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			console.log("inside getProductQuanity success");
			if(results.statusCode == 200){
				console.log("valid getProductQuanity");
				if(results.quantity!=null || results.quantity != "")
					json_responses = {"statusCode" : 200, "quantity": results.quantity};
				else
					json_responses = {"statusCode" : 200, "quantity": 0};
				res.send(json_responses);
			}
			else {    
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		}  
	});
	
};


function getAmount(req, res){
	
	prod_id = req.session.prod_id;
	is_urgent = req.session.is_urgent;
	delete req.session['is_urgent'];
	console.log("p"+prod_id);
	var cust_id = req.session.user_id;
	var json_responses;

	var msg_payload = { "prod_id": prod_id};
	mq_client.make_request('getAmount_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(results.statusCode!= "200"){
			json_responses = {"statusCode" : 200};
			res.send(json_responses);
		}
		else 
		{
			console.log("inside success");
			if(results.statusCode == 200){
				json_responses = {"statusCode" : 200, "bid": results.product};
				res.send(json_responses);
			}
			else {    
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		}  
	});
	
	
}	

function sold(req, res){
	var user_id = req.session.user_id;
	prod_id = req.session.prod_id;
	delete req.session['prod_id'];
	var cust_id = req.session.user_id;
	console.log("prod_id"+ prod_id);
	var json_responses;
	var msg_payload = { "prod_id": prod_id, "cust_id": cust_id};
	mq_client.make_request('instantBuy_queue',msg_payload, function(err,results){
		console.log(results);
		if(results.statusCode != "200"){
			json_responses = {"statusCode" : 402};
			res.send(json_responses);
		}
		else 
		{
			json_responses= {"statusCode" : 200};
			res.send(json_responses);
		}  
	});
}	

exports.emptyCart = emptyCart
exports.removeFromCart = removeFromCart
exports.addBid = addBid;
exports.addToCart = addToCart;
exports.getCart = getCart;
exports.payment1 = payment1;
exports.getCartAmount = getCartAmount;
exports.getAmount = getAmount;
exports.sold = sold;