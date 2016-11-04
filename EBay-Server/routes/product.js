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

function productDetails(msg, callback){
	var res = {};
	var prod_id = msg.prod_id
	console.log("product_id" + prod_id );
	
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + " prod_id: " + prod_id);
		var obj_id = new ObjectID(prod_id);
		console.log("obj_id: " + obj_id);
		var coll = mongo.collection('product');
		coll.findOne({"_id":obj_id}, function(err, products){
			if(err){
				console.log("error: " + err);
	    				res.statusCode = "401";
	    				callback(null, res);
	    			}
			else if(products != null)
    			{
				console.log(JSON.stringify(products));
				res.statusCode = "200";
				res.products = products;
				callback(null, res);
    			}
			else{
				res.statusCode = "401";
				callback(null, res);
			}
		});
	});
}

function showProductDetails(req, res){
	
	var prod_id = req.query.prod_id;
	req.session.prod_id = prod_id;
	var customer_id = req.session.user_id;
	ejs.renderFile('./views/productDetails.ejs', {  username:req.session.first_nm, customer_id: customer_id },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
	});
}


function productDetailsOld(req, res){
	
	var prod_id = req.query.prod_id;
	var customer_id = req.session.user_id;
	var post  = [customer_id, prod_id];
	var json_responses;
	
	if(customer_id == undefined){
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
	else{
	
	var queryString ='select p.prod_id , p.label, p.description,(select c.desc from conditions c where c.conditionId = p.condition)  conditions, '+
	'(select b.label from brand b where b.brand_id = p.brand)  brand, p.is_fixed, p.is_auction,' +
 ' (select max(b2.bid_amount) from datahub.bid b2 where b2.product_id = p.prod_id )  max, ' +
 ' (case when p.ship_price is null then 0 else  p.ship_price end ) ship_price , (case when p.price is null then 0 else  p.price end ) price, '+
 ' (select count(b2.bid_id) from datahub.bid b2 where b2.product_id = p.prod_id group by b2.product_id) as count, '+ 
 ' case when exists (select count(*) from datahub.bid b3  where b3.product_id = p.prod_id and b3.customer_id = '  + customer_id + ' group by b3.product_id) '+
 ' then 1 '+
 ' else 0    '+
 ' end as alreadyBid, DATEDIFF(CURDATE(), p.add_ts) as days, '+
 ' (case when (select customer_id FROM datahub.bid where bid_amount = (select max(b.bid_amount) from bid b where b.product_id = ?)) = ? '+
 ' then 1 else 0 end) as max_bidder ' +
 ' from datahub.product p where p.prod_id = ? ' ;
	
	mysql.insertqueryWithParams(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else if(results.length>0)
{
	logger.event("product checked", { user_id: customer_id, product:prod_id, description:results[0].description, brand: results[0].brand, label: results[0].label });
	ejs.renderFile('./views/productDetails.ejs', {  username:req.session.first_nm, data:results },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
	
}
else if(results.length == 0)
{	
		json_responses = {"statusCode" : 402};
		res.send(json_responses);

}
},queryString, [prod_id,customer_id, prod_id]);
	
	}
}


function showProducts(req, res){
	var cust_id = req.session.user_id;
	var prod_id = req.query.prod_id;
	req.session.type = prod_id;
	var cat_id = req.query.cat;
	var json_responses;
	ejs.renderFile('./views/products.ejs', {  username:req.session.first_nm, title:'EBay' },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
}

function getProducts(msg, callback){
	
	var cust_id = msg.cust_id;
	var cat_id  = msg.cat_id;
	var res = {};
	
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('product');
		coll.find({"category_id":cat_id, "seller_id": {$ne: cust_id}}).toArray(function(err, products){
			if(err){
						console.log("error: " + err);
						res.statusCode = "401";
						callback(null, res);
	    			}
	    			else
	    			{
	    				console.log("products: " + products);
	    				res.products = products;
	    				res.statusCode = "200";
						callback(null, res);
	    			}
	    		});
	});
}

function showProducts2(req, res){
	
	var cust_id = req.session.user_id;
	
	var cat_id = req.query.cat;
	var json_responses;
	var queryString = 'select prod_id, is_auction, is_fixed, quantity,brand as brand_id, DATEDIFF(CURDATE(), p.add_ts) as days, (select b.label from brand b where b.brand_id = p.brand)  brand, label, description, price, (select c.desc from conditions c where c.conditionId = p.condition)  conditions from product p where p.quantity > 0 and p.seller_id <> ' + cust_id +' and p.category_id = ' +cat_id+ '';
	
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('product');
		coll.find({"category_id":cat_id, "seller_id": {$ne: cust_id}}).toArray(function(err, products){
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

function showProductsOld(req, res){
	
	var cust_id = req.session.user_id;
	
	var cat_id = req.query.cat;
	var json_responses;
	var queryString = 'select prod_id, is_auction, is_fixed, quantity,brand as brand_id, DATEDIFF(CURDATE(), p.add_ts) as days, (select b.label from brand b where b.brand_id = p.brand)  brand, label, description, price, (select c.desc from conditions c where c.conditionId = p.condition)  conditions from product p where p.quantity > 0 and p.seller_id <> ' + cust_id +' and p.category_id = ' +cat_id+ '';
	
	mysql.fetchData(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else 
{
	logger.event("category checked", { user_id: cust_id, category:cat_id});
	ejs.renderFile('./views/products.ejs', {  username:req.session.first_nm, data:results, title:'EBay' },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
	
}

},queryString,cust_id);
}

function getBrands(msg, callback){
	
	var res = {};
	var type = msg.category;
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL );
		var coll = mongo.collection('brand');
		coll.find({"category":parseInt(type)}).toArray(function(err, brands){
			if(err){
				res.statusCode= "401";
				console.log("error: " + err);
				callback(null, res);
    			}
    			else
    			{
    				console.log("brands: " + brands);
    				
    				res.statusCode= "200";
    				res.brands= brands;
    				callback(null, res);
	    			}
	    		});
	});
}

function addProduct(msg, callback)
{
	var res = {};
	var cust_id = msg.seller_id;
	var label = msg.label;
	var desc = msg.description;
	var quantity = msg.quantity;
	var brand = msg.brand;
	var price = msg.price;
	var condition = msg.condition;
	var is_auction = msg.is_auction;
	var is_fixed = msg.is_fixed;
	var category_id = msg.category_id;
	var start_price = msg.start_price;
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "label: " + label);
		var coll = mongo.collection('product');
	    		coll.insert({
	    			"label": label,
	    			"description": desc,
	    			"brand": brand,
	    			"quantity":quantity ,
	    			"seller_id": cust_id,
	    			"price": price,
	    			"condition":condition,
	    			"is_auction":is_auction,
	    			"is_fixed":is_fixed,
	    			"start_price":start_price,
	    			"category_id":category_id, 
	    			"ship_price": msg.ship_price,
	    			"bid":[],
	    			"bidCount":0,
	    			"add_ts":new Date()
	    		}, function(err, product){
	    			console.log("product -- "+product.insertedIds);
	    			var json_responses;
	    			if(err){
	    				res.statusCode = "401";
	    				callback(null, res);
	    			}
	    			else
	    			{
	    				console.log("product for sale");
	    				res.statusCode = "200";
	    				callback(null, res);
	    			}
	    		});
	}); 
}

function paymentNow(req, res){
	
	var prod_id = req.query.prod_id;
	var customer_id = req.session.user_id;
	var json_responses;
	
	if(customer_id == undefined){
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
	else{
	
	ejs.renderFile('./views/checkout.ejs', {  username:req.session.first_nm, prod_id:prod_id },function(err, result) {
		if (!err) {
			req.session.prod_id = prod_id;
			req.session.is_urgent = 1;	
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
	
	}
}

exports.paymentNow= paymentNow;
exports.addProduct = addProduct;
exports.getBrands = getBrands;
exports.showProducts = showProducts;
exports.productDetails = productDetails;
exports.showProductDetails = showProductDetails;
exports.getProducts = getProducts;