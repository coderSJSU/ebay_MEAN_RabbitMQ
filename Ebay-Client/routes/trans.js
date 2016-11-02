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

function addBid(req, res){
	
	// check user already exists
	var amount = req.param("amount");
	var prodId = req.param("prodId");
	var user_id = req.session.user_id;
	var json_responses;
	var post  = {bid_amount: amount, product_id : prodId, customer_id: user_id};
	var addBid="insert into bid set ? ";
	var json_responses;
	var obj_id = new ObjectID(prodId);
	mongo.connect(mongoURL, function(){
		//console.log('Connected too mongo at: ' + mongoURL + "user_id: " + user_id);
		var coll = mongo.collection('product');
		console.log("1");
		coll.find({"_id": obj_id}).forEach(function(prod, err){
			if(err){
				console.log("error: " + JSON.stringify(err));
				json_responses = {"statusCode" : 405};
				res.send(json_responses);
    			}
    			else
    			{
    				console.log("2");
    				
    				if(amount > parseInt(prod.bid.bid_amount)){
    					console.log("3");
    					coll.update({"_id":obj_id},{$set:{bid:{
    						"bid_amount": amount, 
    						"customer_id": user_id,
    						"add_ts":new Date()
    	    		}}}, function(err, cart){
    	    			var json_responses;
    	    			if(err){
    	    				json_responses = {"statusCode" : 401};
    	    				res.send(json_responses);
    	    			}
    	    			else
    	    			{
    	    				if(cart !=null){
    	    					bidLogger.bid("bid submitted",{ user: user_id, product_id: prodId, amount: amount});
    	    					json_responses = {"statusCode" : 200, "id":cart.insertedIds, "post": post};
    	    				}
    	    				else
    	    					json_responses = {"statusCode" : 401};
    	    				res.send(json_responses);
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
    				console.log("count: " + (count+1));
    				coll.update({"_id":obj_id},
    				{$set: {bidCount: count}}		
    				);
    				}
    				else{
    					json_responses = {"statusCode" : 200};
	    				res.send(json_responses);
    				}
    			}
	    		});
		
	}); 
	
	/*mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('bid');
	    		coll.insert({
	    			"bid_amount": amount, 
	    			"prod_id" : prodId, 
	    			"customer_id": user_id,
	    			"add_ts":new Date()
	    		}, function(err, product){
	    			console.log("product -- "+product.insertedIds);
	    			var json_responses;
	    			if(err){
	    				json_responses = {"statusCode" : 401};
	    				res.send(json_responses);
	    			}
	    			else
	    			{
	    				if(product !=null){
	    					bidLogger.bid("bid submitted",{ user: user_id, product_id: prodId, amount: amount});
	    					json_responses = {"statusCode" : 200, "id":product.insertedIds, "post": post};
	    				}
	    				else
	    					json_responses = {"statusCode" : 401};
	    				res.send(json_responses);
	    			}
	    		});
	}); */
}

function addBidOld(req, res){
	
	// check user already exists
	var amount = req.param("amount");
	var prodId = req.param("prodId");
	var user_id = req.session.user_id;
	var json_responses;
	var post  = {bid_amount: amount, product_id : prodId, customer_id: user_id};
	var addBid="insert into bid set ? ";
	var json_responses;
	mysql.insertqueryWithParamsReturnData(function(err,results, post){
		if(err){
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
		else
		{	
			bidLogger.bid("bid submitted",{ user: user_id, product_id: prodId, amount: amount});
			json_responses = {"statusCode" : 200, "id":results.insertId, "post": post};
			res.send(json_responses);
		}
		},addBid, post);
}

function addToCart(req, res){
	
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
	var post  = {product_id:finalData.id, user_id: user_id, quantity: finalData.quantity};
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "user_id: " + user_id);
		var coll = mongo.collection('cart');
	    		coll.insert({
	    			"product_id":finalData.id, 
	    			"user_id": user_id, 
	    			"brand": finalData.brand,
	    			"quantity": finalData.quantity,
	    			"label": finalData.label,
	    			"price": finalData.price,
	    			"condition": finalData.condition,
	    			"deliveryPrice": finalData.deliveryPrice,
	    			"add_ts":new Date()
	    		}, function(err, cart){
	    			console.log("cart -- "+cart.insertedIds);
	    			var json_responses;
	    			if(err){
	    				json_responses = {"statusCode" : 401};
	    				res.send(json_responses);
	    			}
	    			else
	    			{
	    				logger.event("added to cart", { user: user_id, product: finalData.id});	
	    				json_responses = {"statusCode" : 200, "id":cart.insertedIds};
	    					res.send(json_responses);
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

function getCart(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		mongo.connect(mongoURL, function(){
		var coll = mongo.collection('cart');
		coll.find({"user_id":cust_id}).toArray(function(err, products){
			if(err){
					json_responses = {"statusCode" : 401};
					res.send(json_responses);	
    			}
    			else
	    			{
    				if(products!=null)
    				json_responses = {"statusCode" : 200, "data": products};
    				else
					json_responses = {"statusCode" : 200, "data": products};
    				res.send(json_responses);
	    			}
	    		});
		});
	}
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

function getCartAmount(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	var queryString = 'select c.quantity, '+ 
  ' (case when p.ship_price is null then 0 else  p.ship_price end ) ship_price , (case when p.price is null then 0 else  p.price end ) price  '+
  ' from product p, cart c where p.prod_id = c.product_id and c.user_id =' + cust_id+ '';
	
	if(cust_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		mongo.connect(mongoURL, function(){
			console.log('Connected too mongo at: ' + mongoURL );
			var coll = mongo.collection('cart');
			coll.find({"user_id":cust_id}).toArray(function(err, products){
				if(err){
					json_responses = {"statusCode" : 401};
					res.send(json_responses);;
    			}
    			else
    			{
    				if(products != null){
    					json_responses = {"statusCode" : 200, "data": products};
    					res.send(json_responses);
    				}
    				else{
    					json_responses = {"statusCode" : 401, "data": ""};
    					res.send(json_responses);
    				}
		    			}
		    		});
		});
	}
}


function getCartAmountOld(req, res){
	
	var cust_id = req.session.user_id;
	var json_responses;
	var queryString = 'select c.quantity, '+ 
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


function removeFromCart(req, res){
	var user_id = req.session.user_id;
	var json_responses;
	var cart_id = req.param("cart_id");
	//var deleteItem='delete from cart where user_id = '+user_id+' and product_id ='+prod_id+'';
	//var updateCart='update cart set cart_delete = 1 where user_id = '+user_id+' and product_id ='+prod_id+'';
	var json_responses;
	if(user_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	else{
		var obj_id = new ObjectID(cart_id);
		console.log("obj_id: " + obj_id);
		mongo.connect(mongoURL, function(){	
		var coll = mongo.collection('cart');
		coll.remove({"_id":obj_id}, function(err, products){
			console.log(products.description);
			if(err){
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
		});
	}
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

exports.getProductQuanity = function(req, res){
	var data = req.param("data");
	var finalData = JSON.parse(data);
	var json_responses;
	var queryString = 'select quantity ' +
  ' from product where prod_id =' + finalData.prod_id+ '';
	var obj_id = new ObjectID(finalData.prod_id);
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "product_id   :" + finalData.prod_id );
		var coll = mongo.collection('product');
		coll.findOne({"_id":obj_id},{"quantity":1},function(err, product){
			if(err){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else
			{
				if(product!=null)
				json_responses = {"statusCode" : 200, "quantity": product.quantity};
				else
					json_responses = {"statusCode" : 200, "quantity": 0};
				res.send(json_responses);
			}
		});
	});
};

exports.getProductQuanityOld = function(req, res){
	var data = req.param("data");
	var finalData = JSON.parse(data);
	var json_responses;
	var queryString = 'select quantity ' +
  ' from product where prod_id =' + finalData.prod_id+ '';
	
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
};

function getAmount(req, res){
	
	prod_id = req.session.prod_id;
	is_urgent = req.session.is_urgent;
	//delete req.session['prod_id'];
	delete req.session['is_urgent'];
	
	var cust_id = req.session.user_id;
	var json_responses;

	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "product_id   :" + finalData.prod_id );
		var coll = mongo.collection('product');
		coll.findOne({"prod_id":prod_id},{$group:{amount:{$max: "$amount"}}},function(err, product){
			if(err){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else
			{
				json_responses = {"statusCode" : 200, "bid": product};
				res.send(json_responses);
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

function sold(req, res){
	var user_id = req.session.user_id;
	prod_id = req.session.prod_id;
	delete req.session['prod_id'];
	
	var cust_id = req.session.user_id;
	var json_responses;

	var post  = {customer_id: user_id, product_id : prod_id, quantity: "1"};
	var addSale="insert into sales set ? ";
	var json_responses;
	var obj_id = new ObjectID(cust_id);
	console.log("obj_id: " + obj_id);
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('product');
		coll.update({"_id":obj_id},{$push:{bought:{$each:[{"product":prod_id,"quantity":quantity}]}}}
		),(function(err, products){
			if(err){
				console.log("error: " + err);
	    				json_responses = {"statusCode" : 401};
	    				res.send(json_responses);
	    			}
	    			else
	    			{
	    				logger.event("category checked", { user_id: cust_id, category:cat_id});
	    				
	    				console.log("products: " + products);
	    				
	    				ejs.renderFile('./views/products.ejs', {  username:req.session.first_nm, data:products, title:'EBay' },function(err, result) {
	    					if (!err) {
	    						res.end(result);
	    						}
	    						else {
	    						res.end('An error occurred');
	    						console.log(err);
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