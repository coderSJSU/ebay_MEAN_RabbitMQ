var ejs = require("ejs");
var mysql = require('./mysql');
var winston = require('winston');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";
ObjectID = require('mongodb').ObjectID;


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

function addBid(msg, callback){
	
	var amount = msg.amount;
	var prodId = msg.prodId;
	var user_id = msg.user_id;
	var json_responses;
	var obj_id = new ObjectID(prodId);
	var res = {};
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('product');
		console.log("1");
		coll.find({"_id": obj_id}).forEach(function(prod, err){
			if(err){
				console.log("error: " + JSON.stringify(err));
				res.value = "error";
				res.code = "402";
    			}
    			else
    			{
    				console.log("2" + prod.bid.bid_amount);
    				if(prod.bid.bid_amount == null || prod.bid.bid_amount == undefined || amount > parseInt(prod.bid.bid_amount)){
    					console.log("3");
    					coll.update({"_id":obj_id},{$set:{bid:{
    						"bid_amount": amount, 
    						"customer_id": user_id,
    						"add_ts":new Date()
    	    		}}}, function(err, cart){
    	    			var json_responses;
    	    			if(err){
    	    				res.value = "error";
	    					res.code = "402";
    	    			}
    	    			else
    	    			{
    	    				if(cart !=null){
    	    					res.value = "Success";
    	    					res.code = "200";
    	    				}
    	    				else
    	    					res.value = "error";
    	    					res.code = "402";
    	    			}
    	    		});
    					
    				var count = 0;
    				console.log("pre count: " + prod.bidCount);
    				if(isNaN(prod.bidCount)){
    					console.log("pre count: " + prod.bidCount);
    					count = 0;
    				}
    				else
    					count = parseInt(prod.bidCount) + 1;
    				coll.update({"_id":obj_id},
    				{$set: {bidCount: count}}		
    				);
    				res.statusCode = "200";
					callback(null, res);
    				}
    				else{
    					res.statusCode = "401";
    					callback(null, res);
    				}
    			}
	    		});
	}); 
}

function addToCart(msg, callback){
	
	var res = {};
	console.log("In addtocart: quantity" + msg.quantity);
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL + "user_id: " + msg.user_id);
			var coll = mongo.collection('cart');
	    		coll.insert({
	    			"product_id":msg.product_id, 
	    			"user_id": msg.user_id, 
	    			"brand": msg.brand,
	    			"quantity": msg.quantity,
	    			"label": msg.label,
	    			"price": msg.price,
	    			"condition": msg.condition,
	    			"deliveryPrice": msg.deliveryPrice,
	    			"add_ts":new Date()
	    		}, function(err, cart){
	    			console.log("cart -- "+cart.insertedIds);
	    			var json_responses;
	    			if(err){
	    				res.value = "error";
    					res.statusCode = "401";
    					callback(null, res);
	    			}
	    			else
	    			{
	    				res.value = "Success Login";
	    				res.statusCode = "200";
	    				callback(null, res);
	    			}
	    		});
		}); 
}


function addToCartOld(req, res){
	
	// check user already exists
	var data = req.param("data");
	var finalData = JSON.parse(data);
	var user_id = req.session.user_id;
	
	var json_responses;
	var post  = {product_id:finalData.id, user_id: user_id, quantity: finalData.quantity};
	var addBid="insert into cart set ? ";
	var json_responses;
	if(user_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	mysql.insertqueryWithParamsReturnData(function(err,results, post){
		if(err){
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
		else
		{	
			logger.event("added to cart", { user: user_id, product: finalData.id});	
			json_responses = {"statusCode" : 200, "id":results.insertId, "post": post};
				res.send(json_responses);
		}
		},addBid, post);		
		
}

function getCart(msg, callback){
	
	var cust_id = msg.user_id;
	var res = {};
		mongo.connect(mongoURL, function(){
		var coll = mongo.collection('cart');
		console.log("inside getcart");
		coll.find({"user_id":cust_id}).toArray(function(err, products){
			if(err){
				console.log("inside getcart err");
				res.statusCode = "401";
				res.products = [];
				callback(null, res);
			}
			else
    			{
				console.log("inside getcart success" + JSON.stringify(products));
				res.statusCode = "200";
				res.products = products;
				callback(null, res);
    			}
    		});
		});
}

function getCartOld(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	var queryString = 'select p.prod_id , p.label,p.brand as brand_id, p.description,(select c.desc from conditions c where c.conditionId = p.condition)  conditions, ' + 
	'(select b.label from brand b where b.brand_id = p.brand)  brand, c.quantity, '+ 
  ' (case when p.ship_price is null then 0 else  p.ship_price end ) ship_price , (case when p.price is null then 0 else  p.price end ) price  '+
  ' from product p, cart c where p.prod_id = c.product_id and c.user_id =' + cust_id+ '';
	
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

function getCartAmount(msg, callback){
	
	var cust_id = msg.user_id;
	var res = {};
	
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL );
			var coll = mongo.collection('cart');
			coll.find({"user_id":cust_id}).toArray(function(err, products){
				if(err){
					res.statusCode = "401";
					callback(null, res);
    			}
    			else
    			{
    				if(products != null){
    					res.statusCode = "200";
    					res.products = products;
    					callback(null, res);
    				}
    				else{
    					res.statusCode = "200";
    					res.products = [];
    					callback(null, res);
    				}
    			}
    		});
		});
}

function removeFromCart(msg, callback){
	var cart_id = msg.cart_id;
	var res = {};
		var obj_id = new ObjectID(cart_id);
		console.log("obj_id: " + obj_id);
		mongo.connect(mongoURL, function(){	
		var coll = mongo.collection('cart');
		coll.remove({"_id":obj_id}, function(err, products){
			console.log(products.description);
			if(err){
				res.statusCode= "401";
				callback(null, res);
	    			}
			else
    			{
				res.statusCode= "200";
				callback(null, res);
    			}
    		});
		});
}


function deleteFromCart(err,results, post){
	mysql.deleteData(function(err,results, post){
		if(err){
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
		else
		{	
			console.log(post);
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
		}
		},deleteItem, '');
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

exports.getProductQuanity = function(msg, callback){
	var res = {};

	var obj_id = new ObjectID(msg.prod_id);
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "product_id   :" + msg.prod_id );
		var coll = mongo.collection('product');
		coll.findOne({"_id":obj_id},{"quantity":1},function(err, product){
			if(err){
				console.log('Connected too mongo at: ' + mongoURL + "product_id   :" + msg.prod_id );
				//json_responses = {"statusCode" : 401};
				res.statusCode = 402;
				callback(null, res);
			}
			else
			{
				if(product!=null){
					res.quantity = product.quantity;
					res.statusCode = 200;
					callback(null, res);
				}
				else{
					res.quantity = 0;
					res.statusCode = 200;
					callback(null, res);
				}
			}
		});
	});
};


function getAmount(msg, callback){
	
	prod_id = msg.prod_id;
	var res = {};
	var obj_id = new ObjectID(prod_id);
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "product_id   :" + msg.prod_id );
		var coll = mongo.collection('product');
		coll.findOne({"_id":obj_id},{"bid":1,"_id":0},function(err, product){
			if(err){
				console.log(err);
				res.statusCode = "401";
				callback(null, res);
			}
			else
			{
				console.log(JSON.stringify(product));
				res.statusCode = "200";
				res.product = product;
				callback(null, res);
			}
		});
	});
	
}	


function getAmountOld(req, res){
	
	prod_id = req.session.prod_id;
	is_urgent = req.session.is_urgent;
	//delete req.session['prod_id'];
	delete req.session['is_urgent'];
	
	var cust_id = req.session.user_id;
	var json_responses;

	var queryString = 'select max(bid_amount) as max'+ 
	  ' from bid where product_id =' + prod_id+ '';
		
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
				json_responses = {"statusCode" : 200, "bid": results};
				res.send(json_responses);
			}
			
			},queryString,'');
		}
	
}	


function soldOld(req, res){
	var user_id = req.session.user_id;
	prod_id = req.session.prod_id;
	delete req.session['prod_id'];
	
	var cust_id = req.session.user_id;
	var json_responses;

	var post  = {customer_id: user_id, product_id : prod_id, quantity: "1"};
	var addSale="insert into sales set ? ";
	var json_responses;
	mysql.insertqueryWithParamsReturnData(function(err,results, post){
		if(err){
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
		else
		{	
			logger.event("product sold", { user: user_id, product: prod_id, quantity: "1"});
				json_responses = {"statusCode" : 200, };
				res.send(json_responses);
		}
		},addSale, post);
}	

function sold(msg, callback){
	var res = {};
	var user_id = msg.cust_id;
	var prod_id = msg.prod_id;

	var obj_id = new ObjectID(prod_id);
	console.log("obj_id: " + obj_id);
	
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('product');
		coll.find({"_id": obj_id}).forEach(function(prod, err){
			if(err){
				console.log("error: " + JSON.stringify(err));
				res.statusCode = "402";
				callback(null, res);
    			}
    			else
    			{
    				var obj_id = new ObjectID(user_id);
    				console.log("cust: " + obj_id);
    				coll = mongo.collection('login');
    				coll.update({"_id":obj_id},{$push:{bought:{
    					"prod_id": prod._id,
    					"label": prod.label,
    					"description": prod.description,
    					"brand": prod.brand,
    					"quantity":prod.quantity ,
    					"price": prod.price,
    					"condition":prod.condition,
    					"category_id":prod.category_id, 
    					"ship_price": prod.ship_price,
						"add_ts":new Date()
	    		}}}, function(err, cart){
	    			var json_responses;
	    			if(err){
	    				res.statusCode = "402";
	    				callback(null, res);
	    			}
	    			else
	    			{
	    				if(cart !=null){
	    					res.statusCode = "200";
	    					callback(null, res);
	    				}
	    				else
	    					res.statusCode = "402";
	    					callback(null, res);
	    			}
	    		});
			
    			}
		});
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