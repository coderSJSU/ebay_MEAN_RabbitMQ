var ejs = require("ejs");
var mysql = require('./mysql');
function signin(req,res) {
ejs.renderFile('./views/signin.ejs',function(err, result) {
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


function sell(req,res) {
	
	if(req.session.user_id){
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	
	res.render('index', { title: 'EBay', username:req.session.first_nm, last_ts: req.session.last_ts },function(err, result) {
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
	ejs.renderFile('./views/sell.ejs',function(err, result) {
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
	}

function getCart(req,res) {
	ejs.renderFile('./views/cart.ejs',{ title: 'EBay', username: req.session.first_nm },function(err, result) {
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


function cardDetails(req,res) {
	ejs.renderFile('./views/cardDetails.ejs',function(err, result) {
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

function afterSignIn2(req,res)
{
// check user already exists
	console.log("Query is:"+"sadas");	
	var getUser="select * from new_table where user_id = 1";
console.log("Query is:"+getUser);
mysql.fetchData(function(err,results){
if(err){
throw err;
}
else
{
if(results.length > 0){
console.log("valid Login");
ejs.renderFile('./views/successLogin.ejs', {
data: results } , function(err, result) {
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
else {
console.log("Invalid Login");
ejs.renderFile('./views/failLogin.ejs',function(err, result) {
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
}
},getUser);
}
function getAllUsers(req,res)
{
var getAllUsers = "select * from users";
console.log("Query is:"+getAllUsers);
mysql.fetchData(function(err,results){
if(err){
throw err;
}
else
{
if(results.length > 0){
var rows = results;
var jsonString = JSON.stringify(results);
var jsonParse = JSON.parse(jsonString);
console.log("Results Type: "+(typeof results));
console.log("Result Element Type:"+(typeof
rows[0].emailid));
console.log("Results Stringify Type:"+(typeof
jsonString));
console.log("Results Parse Type:"+(typeof
jsString));
console.log("Results: "+(results));
console.log("Result Element:"+(rows[0].emailid));
console.log("Results Stringify:"+(jsonString));
console.log("Results Parse:"+(jsonParse));
ejs.renderFile('./views/successLogin.ejs',{data:jsonParse},function(err, result) {
// render on success
	if (err) {
		res.end('An error occurred');
		console.log(err);
	}
// render or error
	else {
		res.end(result);
	}
	// render or error
});
}
else {
console.log("No users found in database");
ejs.renderFile('./views/failLogin.ejs',function(err, result) {
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
}
},getAllUsers);
}

function afterSignIn(req,res){
var email = req.param("email");
var password = req.param("password");
req.session.email = email;
console.log(email+"s"+password);
if(email!=""&&password !=""){
	res.render('index', { title: 'EBay' },function(err, result) {
	if (!err) {
	res.end(result);
	}
	else {
	res.end('An error occurred');
	console.log(err);
	}
	});
}
}
function verifyCard(req,res)
{
var cardNum = req.param("cNumber");
var expiryDate = req.param("expDate");
var cvv = req.param("cvv");
var cal = expiryDate.split("-");
var inputMonth = cal[1];
var inputYear = cal[0];
console.log("cvv: " +cvv +"  cardNum: " +cardNum +"   expireDate: " + expiryDate);
var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
console.log(year +"-" +month);

if(inputYear>year ||(inputYear== year && inputMonth>month)){
	console.log("Valid Card");
	ejs.renderFile('./views/cardVerified.ejs',function(err, result) {
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
	console.log("Invalid Card");
	ejs.renderFile('./views/invalidCard.ejs',function(err, result) {
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


}

exports.payment2 = function(req, res){
	ejs.renderFile('./views/checkout.ejs', {  username:req.session.first_nm, prod_id: "invalid" },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
};

exports.paymentGateway = function(req, res){
	ejs.renderFile('./views/cardDetails.ejs', {  username:req.session.first_nm },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
};

exports.urgentPayment = function(req, res){
	var prod_id = req.query.prod_id;
	console.log(prod_id);
	ejs.renderFile('./views/urgentCardPayment.ejs', {  username:req.session.first_nm, prod_id: prod_id },function(err, result) {
		if (!err) {
			res.end(result);
			}
			else {
			res.end('An error occurred');
			console.log(err);
			}
			});
};

exports.signin=signin;
exports.cardDetails=cardDetails;
exports.afterSignIn=afterSignIn;
exports.verifyCard=verifyCard;
exports.getAllUsers=getAllUsers;
exports.sell = sell;
exports.getCart=getCart;