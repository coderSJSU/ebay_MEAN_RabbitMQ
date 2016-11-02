//super simple rpc server example
var amqp = require('amqp')
, util = require('util')
, http = require('http');
var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, index = require('./routes/index')
, http = require('http')
, path = require('path')
, home = require('./routes/home')
, product = require('./routes/product')
, trans = require('./routes/trans')
, profile = require('./routes/profile');

var mongoSessionConnectURL = "mongodb://localhost:27017/login";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./services/mongo");
var login = require('./services/login');
var Mocha = require("mocha");
var app = express();
var clientSession = require("client-sessions");
var mongoSessionConnectURL = "mongodb://localhost:27017/login";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");


var mocha = new Mocha({
    ui: "tdd",
    reporter: "spec"
});

mocha.addFile("./public/tests/test.js");

var cnn = amqp.createConnection({host:'127.0.0.1'});

cnn.on('ready', function(){
	console.log("listening on login_queue");

	cnn.queue('login_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			user.checkUser(message, function(err,res){

				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
	cnn.queue('register_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("register Message: "+JSON.stringify(message));
			util.log("register DeliveryInfo: "+JSON.stringify(deliveryInfo));
			user.register(message, function(err,res){
				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
});

app.get('/', home.signin);
app.get('/cart', home.getCart);


app.get('/users', user.list);
app.get('/signin', home.signin);
app.get('/sell', index.sell);
app.get('/loggedIn', user.loggedIn);

app.post('/checkUser', user.checkUser)
app.post('/register', user.register)
app.get('/productsPage', product.showProducts)
app.post('/addBid', trans.addBid)
app.post('/productDetails', product.productDetails)
app.get('/quickCheckout', product.paymentNow)
app.get('/prodDescription', product.prodDescription)
app.post('/addProduct', product.addProduct)
app.get('/signOut', user.signOut)
app.post('/addToCart', trans.addToCart)
app.post('/getCart', trans.getCart)
app.post('/getCartAmount', trans.getCartAmount)
app.post('/getAmount', trans.getAmount)
app.post('/removeFromCart', trans.removeFromCart)
app.get('/sold', trans.sold)
app.post('/emptyCart', trans.emptyCart)
app.post('/payment1', trans.payment1);
app.get('/payment2' , home.payment2);
app.get('/paymentGateway', home.paymentGateway);
app.get('/urgentPayment', home.urgentPayment);
app.post('/getProductQuanity', trans.getProductQuanity);
app.get('/profile', index.profile);
app.post('/getItemsForSale', profile.getItemsForSale);
app.get('/getItemsBought', profile.getItemsBought);
app.get('/getUserInfo', profile.getUserInfo);
app.post('/saveProfile', profile.saveProfile);
app.get('/showProductDetails', product.showProductDetails);
app.get('/showProducts',product.showProducts);
app.get('/getProducts', product.getProducts);

mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
});
