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

function productDetails(req, res){
	var prod_id = req.session.prod_id
	//req.session.prod_id = "";
	console.log("product_id" + prod_id );
	var customer_id = req.session.user_id;
	var json_responses;
	
	if(customer_id == undefined){
		res.render('signin',function(err, result) {
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
		var msg_payload = { "prod_id": prod_id};
		mq_client.make_request('productDetails_queue',msg_payload, function(err,results){
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				console.log("inside success");
				if(results.statusCode == 200){
					var products  = results.products;
					console.log(JSON.stringify(products));
					var winner = 0;
					if(products.is_auction == "1" || products.is_auction == 1)
					{
						if(products.bid != null){
							if(products.bid.customer_id != null){
								if(customer_id == products.bid.customer_id)
									winner = 1;
							}
						}	
					}
					json_responses = {"statusCode" : 200 ,username:req.session.first_nm, data:products, customer_id: customer_id, winner:winner};
					
					console.log("json_responses " + JSON.stringify(json_responses));
					logger.event("product checked", { user_id: customer_id, product:prod_id, description:products.description, brand: products.brand, label: products.label });
					console.log("json_responses " + JSON.stringify(json_responses));
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

function getProducts(req, res){
	
	var cust_id = req.session.user_id;
	var cat_id  = req.session.type;
	req.session.type = "";
	var json_responses;
	
	if(cust_id == undefined){
		res.render('signin',function(err, result) {
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
		var msg_payload = { "cust_id": cust_id,"cat_id":cat_id};
		mq_client.make_request('getProducts_queue',msg_payload, function(err,results){
			console.log(results);
			if(results.statusCode == "401"){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else 
			{
				console.log("inside success");
				logger.event("category checked", { user_id: cust_id, category:cat_id, data: results.products});
				console.log("products: " + results.products);
				json_responses = {"statusCode" : 200, results: results.products};
				res.send(json_responses);
			}  
		});
	}
}

function prodDescription(req, res){
	
	var cust_id = req.session.user_id;
	var type = req.query.type;
	
	var json_responses ;
	req.session.cat_id = type;
	
	var msg_payload = { "category": type};
	mq_client.make_request('getBrands_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			logger.event("category checked", { user_id: cust_id, category:type});
			
			console.log("brands: " + results.brands);
			
			ejs.renderFile('./views/sellProduct.ejs', {  username:req.session.first_nm, data:results.brands, user_id: cust_id},function(err, result) {
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
}

function addProduct(req, res)
{
	var json_responses;
	var cust_id = req.session.user_id;
	if(cust_id == undefined){
	json_responses = {"statusCode" : 405};
	res.send(json_responses);
	}
	else{
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
	
		var msg_payload = {"label": label,
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
				"ship_price": ship_price};
		mq_client.make_request('addProduct_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(results.statusCode != "200"){
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else 
			{
				console.log("inside success");
				logger.event("Added product for sale description: " + desc +
				", brand :" + brand +
				", quantity :" +quantity +
				", seller_id :" + cust_id+
				", price :" + price+
				", condition :" +condition+
				", is_auction :" +is_auction+
				", is_fixed :" +is_fixed+
				", start_price :" +startingPrice+
				", category_id :" +category_id+
				", ship_price :" + ship_price);
				json_responses = {"statusCode" : 200};
				res.send(json_responses);
			}  
		});
}
}

function paymentNow(req, res){
	
	var prod_id = req.session.prod_id;
	console.log("req.session.prod_id"+req.session.prod_id);
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
exports.showProductDetails = showProductDetails;
exports.getProducts = getProducts;