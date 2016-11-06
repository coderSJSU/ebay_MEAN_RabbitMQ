
/**
 * Module dependencies.
 */

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

var Mocha = require("mocha");
var app = express();
var clientSession = require("client-sessions");
var mongoSessionConnectURL = "mongodb://localhost:27017/login";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");
var MongoStore = require('connect-mongo')(express);

var passport = require('passport');
require('./config/passport')(passport);

//app.use(passport.initialize());// app.use(passport.session());

var mocha = new Mocha({
    ui: "tdd",
    reporter: "spec"
});

mocha.addFile("./public/tests/test.js");

//Run the tests.
/*mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);  // exit with non-zero status if there were failures
  });
});*/

app.use(expressSession({
	secret: 'cmpe273_teststring',
	resave:false,
	saveUninitialized: false,
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({ url: mongoSessionConnectURL })
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', home.signin);
app.get('/cart', home.getCart);


app.get('/users', user.list);
app.get('/signin', home.signin);
app.get('/sell', index.sell);
app.get('/loggedIn', user.loggedIn);

//app.post('/checkUser', user.checkUser)
//app.post('/register', user.register)
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

http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});



/*app.post('/signup', passport.authenticate('local-signup', { 
	successRedirect : '/profile', 
	failureRedirect : '/signup2',
	failureFlash : true  }));*/


app.post('/register', function(req, res, next) {
	passport.authenticate('local-signup', function(err, data) {
	console.log("after register" + data);
	var json_responses
	if(data == "error")
		json_responses = {"statusCode" : 402};
	else
		json_responses = {"statusCode" : 200};
	res.send(json_responses);
	})(req, res, next)
  }); 


app.post('/checkUser', function(req, res, next) {
	passport.authenticate('local-login', function(err, data) {
	console.log("after auth");
	var json_responses
	if(data == "error")
		json_responses = {"statusCode" : 402};
	else
		json_responses = {"statusCode" : 200};
	res.send(json_responses);
	})(req, res, next)
  }); 	