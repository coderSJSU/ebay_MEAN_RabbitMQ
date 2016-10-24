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


function productDetails(req, res){
	
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
	
	var queryString ='' ;
	
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + " prod_id: " + prod_id);
		var obj_id = new ObjectID(prod_id);
		console.log("obj_id: " + obj_id);
		var coll = mongo.collection('product');
		coll.findOne({"_id":obj_id}, function(err, products){
			console.log(products.description);
			if(err){
				console.log("error: " + err);
	    				json_responses = {"statusCode" : 401};
	    				res.send(json_responses);
	    			}
			else if(products != null)
    			{
				console.log(JSON.stringify(products));
				//logger.event("product checked", { user_id: customer_id, product:prod_id, description:results[0].description, brand: results[0].brand, label: results[0].label });
				ejs.renderFile('./views/productDetails.ejs', {  username:req.session.first_nm, data:products },function(err, result) {
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
				json_responses = {"statusCode" : 402};
				res.send(json_responses);
				
			}
	    		});
	});
	}
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

function prodDescription(req, res){
	
	var cust_id = req.session.user_id;
	var cust_id = 1;
	var type = req.query.type;
	
	var json_responses ;
	var queryString = 'select * from brand where category_id = '+type+'';
	req.session.cat_id = type;
	mysql.fetchData(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
}
else
{
	var data = results;
	var conditions;
	var conditionsQuery = 'select * from conditions';
	
	mysql.fetchData(function(err,results){
if(err){
	json_responses = {"statusCode" : 401};
	res.send(json_responses);
	res.end('An error occurred');
}
else
{
	conditions = results;
	ejs.renderFile('./views/sellProduct.ejs', {  username:req.session.first_nm, data:data, conditions:conditions },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
}
},conditionsQuery,'');
	
	
}
},queryString,'');
}

function addProduct(req,res)
{
	var json_responses;
	var cust_id = req.session.user_id;
	if(cust_id == undefined){
	json_responses = {"statusCode" : 405};
	res.send(json_responses);
	}
	else{
		
	//var cust_id = req.session.cust_id;
	var label = req.param("label");
	var desc = req.param("desc");
	var quantity = req.param("quantity");
	var brand = req.param("brand");
	var price = req.param("price");
	var condition = req.param("condition");
	var is_auction = req.param("is_auction");
	var is_fixed = req.param("is_fixed");
	var freeShip = req.param("freeShip");
	var ship_price = '5';
	if(freeShip)
		ship_price = '0';
	
	if(is_auction == '1'){
		price = '0';
		quantity = '1';
	}
	var startingPrice = req.param("startingPrice");
	if(is_auction == '0')
		startingPrice = '0';
	var category_id = req.session.cat_id;
	//var post  = {label: label, description : desc, brand: brand, quantity: quantity, price:price,seller_id:cust_id, condition: condition,is_auction:is_auction,is_fixed:is_fixed,start_price:startingPrice,category_id:category_id, ship_price: ship_price };
	
	mongo.connect(mongoURL, function(){
		console.log('Connected too mongo at: ' + mongoURL + "name: " + req.body.name);
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
	    			"start_price":startingPrice,
	    			"category_id":category_id, 
	    			"ship_price": ship_price,
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
	    				//req.session.last_ts = "";
	    				//req.session.user_id = user.insertedIds;
	    				logger.event("product for sale");
	    				json_responses = {"statusCode" : 200};
	    				res.send(json_responses);
	    			}
	    		});
	}); 
}
}


function addProductOld(req,res)
{
	var json_responses;
	var cust_id = req.session.user_id;
	if(cust_id == undefined){
	json_responses = {"statusCode" : 405};
	res.send(json_responses);
	}
	else{
		
	//var cust_id = req.session.cust_id;
	var label = req.param("label");
	var desc = req.param("desc");
	var quantity = req.param("quantity");
	var brand = req.param("brand");
	var price = req.param("price");
	var condition = req.param("condition");
	var is_auction = req.param("is_auction");
	var is_fixed = req.param("is_fixed");
	var freeShip = req.param("freeShip");
	var ship_price = '5';
	if(freeShip)
		ship_price = '0';
	
	if(is_auction == '1'){
		price = '0';
		quantity = '1';
	}
	var startingPrice = req.param("startingPrice");
	if(is_auction == '0')
		startingPrice = '0';
	var category_id = req.session.cat_id;
	var post  = {label: label, description : desc, brand: brand, quantity: quantity, price:price,seller_id:cust_id, condition: condition,is_auction:is_auction,is_fixed:is_fixed,start_price:startingPrice,category_id:category_id, ship_price: ship_price };
	var insertproduct="insert into datahub.product set ? ";
mysql.insertqueryWithParams(function(err,results){
if(err){
throw err;
}
else
{
	var json_responses;
	
	if(err){
		json_responses = {"statusCode" : 401};
		res.send(json_responses);
	}
	else
	{	
		logger.event("product for sale", { user_id: cust_id, label:label, description:desc, brand:brand});
		json_responses = {"statusCode" : 200};
		res.send(json_responses);

	}
}
},insertproduct, post);
}
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
exports.prodDescription = prodDescription;
exports.showProducts = showProducts;
exports.productDetails = productDetails;