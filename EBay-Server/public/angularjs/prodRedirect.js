var prodRedirect = angular.module('prodRedirect', []);
//defining the login controller
prodRedirect.controllers

prodRedirect.controller('prodRedirect', function($scope, $http) {
$scope.productsPage = function(cat) {
	window.location.assign("/productsPage?cat="+cat);
}

$scope.displayProductOld = function(prod_id) {
	window.location.assign("/productDetails?prod_id="+prod_id);
}

$scope.init = function initProducts() {
	$http({
		method : "GET",
		url : '/getProducts',
		data : {
		}
	}).success(function(data) {
		if (data.statusCode == 401) {
			$scope.invalid_login = false;
			$scope.validlogin = true;
		}
		else if (data.statusCode == 405) {
			alert("Login First to vew cart");
			window.location.assign("/signin");
		}
		else
			{
			$scope.data = [ ];
			for(var i=0; i < data.results.length; i++){
				$scope.data.push(data.results[i]);
			}
		}
	}).error(function(error) {
	});
};

$scope.init();

$scope.displayProduct = function(prod_id) {
	$http({
		method : "GET",
		url : '/productDetails',
		data : {
			"prod_id" : prod_id
		}
	}).success(function(data) {
		//checking the response data for statusCode
		if (data.statusCode == 401) {
		}
		else if (data.statusCode == 402) {
		}
		else if(data.statusCode ==405){
			alert("login first to continue");
			window.location.assign("/signIn");
		}
		else
			{//json_responses = {"statusCode" : 200 ,username:req.session.first_nm, data:products, customer_id: customer_id};
				window.location.assign("/showProductDetails?prod_id="+prod_id);
			}
			//Making a get call to the '/redirectToHomepage' API
			//window.location.assign("/homepage"); 
	}).error(function(error) {
		$scope.validlogin = true;
		$scope.invalid_login = true;
	});
	
	
	
	window.location.assign("/productDetails?prod_id="+prod_id);
}


$scope.sellProduct = function(type) {
	window.location.assign("/prodDescription?type="+type);
}

$scope.addProduct = function() {
	if($scope.selectedBrand == undefined || $scope.selectedBrand==null || $scope.selectedBrand=="")
		alert("Select Brand");
	else if($scope.quantity == undefined && $scope.is_fixed=='1')
		alert("Enter quantity");
	else if($scope.label == undefined || $scope.label==null || $scope.label=="")
		alert("Enter Title");
	else if($scope.desc == undefined || $scope.desc==null || $scope.desc=="")
		alert("Enter Description");
	else if($scope.price == undefined && $scope.is_fixed=='1')
		alert("Enter price");
	else if($scope.selectedCondition == undefined || $scope.selectedCondition==null)
		alert("Select Condition");
	else{
	$http({
		method : "POST",
		url : '/addProduct',
		data : {
			"brand" : $scope.selectedBrand,
			"quantity": $scope.quantity,
			"label": $scope.label,
			"desc": $scope.desc,
			"price": $scope.price,
			"condition": $scope.selectedCondition,
			"is_auction": $scope.is_auction,
			"is_fixed": $scope.is_fixed,
			"startingPrice": $scope.startingPrice,
			"freeShip": $scope.freeShip
		}
	}).success(function(data) {
		//checking the response data for statusCode
		if (data.statusCode == 401) {
		}
		else if (data.statusCode == 402) {
		}
		else if(data.statusCode ==405){
			alert("login first to continue");
			window.location.assign("/signIn");
		}
		else
			{
			alert("Product added for sale");
			window.location.assign("/loggedIn");
			}
			//Making a get call to the '/redirectToHomepage' API
			//window.location.assign("/homepage"); 
	}).error(function(error) {
		$scope.validlogin = true;
		$scope.invalid_login = true;
	});
	}
}

	
})
