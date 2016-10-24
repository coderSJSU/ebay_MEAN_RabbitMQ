var ejs= require('ejs');//importing module ejs
var mysql = require('mysql');//importing module mysql

var q = require('queue');
var maxPoolSize;
var pool = q();

function createPool(size){
	for (i = 0; i < size; i++) {
		if(pool.length<size){
			pool.push(getConnection());
		}
	}
	maxPoolSize = size;
}

createPool(50);

function fetchConnection(){
	if(pool.length>0){
		var connection = pool.pop();
		return connection;	
	}
	else{
		return null;
	}
}

function returnToPool(obj){
	if(pool.length <=maxPoolSize){
		pool.push(obj);
	}
	else
		obj = "";
}



function getConnection(){
	var connection = mysql.createConnection({
	host : 'localhost', //host where mysql server is running
	user : 'root', //user for the mysql application
	password : 'blitz', //password for the mysql application
	database : 'datahub', //database name
	port : 3306 //port, it is 3306 by default for mysql
	});
	return connection;
}


function insertqueryWithParams(callback, sqlQuery, post){
	
	var connection=fetchConnection();
	var query = connection.query(sqlQuery, post, function(err,rows, result) {
	if(err){
		console.log("ERROR: " + err.message);
		callback(err, rows);
	}
	else
	{ 
	callback(err, rows);
	}
	});
	returnToPool(connection);
}

function insertqueryWithParamsReturnData(callback, sqlQuery, post){
	
	var connection=fetchConnection();
	var query = connection.query(sqlQuery, post, function(err,rows, result) {
	if(err){
	console.log("ERROR: " + err.message);
	}
	else
	{ 
	callback(err, rows, post);
	}
	});
	returnToPool(connection);
}

	
//fetching the data from the sql server
function fetchData(callback,sqlQuery,key){
	var connection=fetchConnection();
	connection.query(sqlQuery, [key], function(err, rows, fields) {
	if(err){
	console.log("ERROR: " + err.message);
	}
	else
	{ // return err or result
	callback(err, rows);
	}
	});
	returnToPool(connection);
	}

function deleteData(callback,sqlQuery,key){
	var connection=fetchConnection();
	connection.query(sqlQuery, [key], function(err, rows, fields) {
	if(err){
	console.log("ERROR: " + err.message);
	}
	else
	{ // return err or result
	callback(err, rows);
	}
	});
	returnToPool(connection);
	}

function updateData(callback,sqlQuery,key){
	var connection=fetchConnection();
	connection.query(sqlQuery, [key], function(err, rows, fields) {
	if(err){
	console.log("ERROR: " + err.message);
	}
	else
	{ // return err or result
	callback(err, rows);
	}
	});
	returnToPool(connection);
	}

function updateData(sqlQuery,key){
	var connection=fetchConnection();
	connection.query(sqlQuery, [key], function(err, rows, fields) {
	if(err){
	console.log("ERROR: " + err.message);
	}
	else
	{ // return err or result
	}
	});
	returnToPool(connection);
	}

exports.updateData= updateData;
exports.deleteData= deleteData;
exports.fetchData=fetchData;
exports.getConnection=getConnection;
exports.insertqueryWithParams=insertqueryWithParams;
exports.insertqueryWithParamsReturnData = insertqueryWithParamsReturnData;