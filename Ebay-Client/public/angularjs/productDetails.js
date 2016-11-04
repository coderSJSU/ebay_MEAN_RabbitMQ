var productDetails = angular.module('productDetails', []);

productDetails.controllers

productDetails.controller('productDetails', function($scope, $http) {
	
	
$scope.init = function productDetails() {
		
		$http({
			method : "POST",
			url : '/productDetails',
			data : {
				//"prod_id" : "58103687a78b782368081a30"
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
				var results = data.data;
				$scope.winner = data.winner; 
				var diff = Math.ceil((new Date() - new Date(results.add_ts))/(1000*60*60*24));
				//$scope.data.push(data.data);
				$scope.data = data.data;
				$scope.diff = diff-1;
				$scope.remainingDays = 5-diff;
				}
		}).error(function(error) {
		});
	};
	$scope.init();	
	
	
	
	$scope.addBid = function(amount, prodId) {
		if(!(amount== undefined) && !(prodId== undefined)){
		$http({
			method : "POST",
			url : '/addBid',
			data : {
				"amount" : amount,
				"prodId" : prodId
			}
		}).success(function(data, prodId) {
			if (data.statusCode == 401) 
				alert("Some error occurred. Please try again.");
			else if (data.statusCode == 402) 
				alert("Some error occurred. Please try again.");
			else
				alert("bid submitted");
			window.location.assign("/loggedIn");
		}).error(function(error) {
		});
	};
	}
	
	
	$scope.buyNow = function (prod_id) {
		window.location.assign("/quickCheckout?prod_id="+prod_id);
		}
	

	
	$scope.addToCart = function(quantity, brand, label, canditions, price, ship_price,prod_id) {
		if(quantity == undefined){
			alert("Please enter quantity");
		}
		else{
		var dPrice = ship_price;
		var cartData = JSON.stringify({ 'brand':brand,'label': label, 'price': price,'condition':canditions, 'deliveryPrice':dPrice, 'quantity':$scope.quantity, 'id':prod_id });
		var dataToVerify = JSON.stringify({ 'prod_id':prod_id });
		$http({
			method : "POST",
			url : '/getProductQuanity',
			data : {
				"data" : dataToVerify
			}
		}).success(function(data) {
			if (data.statusCode == 401) {
				//alert(P)
			}
			else if (data.statusCode == 405) {
				alert("Some error occurred, please login and try again");
			}
			else
				{
////					var results = data.data;
					var q = data.quantity;
					if(parseInt(data.quantity)>=parseInt(quantity))
				{
				$http({
					method : "POST",
					url : '/addToCart',
					data : {
						"data" : cartData
					}
				}).success(function(data) {
					if (data.statusCode == 401) {
					}
					else if (data.statusCode == 405) {
						alert("Some error occurred, please login and try again");
					}
					else
						{
						alert("product added to cart");
						window.location.assign("/cart");
						}
				}).error(function(error) {
				});
				}
					else 
						alert("We have only "+parseInt(q) + " items for this product");	
				}
		}).error(function(error) {
		});	
		}
	}
	
})