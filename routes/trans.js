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
	    			"quantity": finalData.quantity,
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
	var prod_id = req.param("prod_id");
	var deleteItem='delete from cart where user_id = '+user_id+' and product_id ='+prod_id+'';
	var updateCart='update cart set cart_delete = 1 where user_id = '+user_id+' and product_id ='+prod_id+'';
	var json_responses;
	if(user_id == undefined){
		json_responses = {"statusCode" : 405};
		res.send(json_responses);
	}
	mysql.deleteData(function(err,results, post){
		if(err){
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
		else
		{	
			mysql.deleteData(function(err,results, post){
				if(err){
					json_responses = {"statusCode" : 401};
					res.send(json_responses);
				}
				else
				{	
					logger.event("removed to cart", { user: user_id, product: prod_id});
					json_responses = {"statusCode" : 200};
					res.send(json_responses);
				}
				},deleteItem, '');
		}
		},updateCart, '');		
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
	var deleteAll='delete from cart where user_id = '+user_id+'';
	var json_responses;
	mysql.deleteData(function(err,results, post){
		if(err){
			json_responses = {"statusCode" : 405};
			res.send(json_responses);
		}
		else
		{	
			logger.event("empty cart", { user: user_id});
			json_responses = {"statusCode" : 200};
			res.send(json_responses);
		}
		},deleteAll, '');		
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


function sold(req, res){
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

exports.emptyCart = emptyCart
exports.removeFromCart = removeFromCart
exports.addBid = addBid;
exports.addToCart = addToCart;
exports.getCart = getCart;
exports.payment1 = payment1;
exports.getCartAmount = getCartAmount;
exports.getAmount = getAmount;
exports.sold = sold;