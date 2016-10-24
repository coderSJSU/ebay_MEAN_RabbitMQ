//loading the 'login' angularJS module
var cart = angular.module('cart', []);

cart.controllers

cart.controller('cart', function($scope, $http) {
	
	$scope.init = function initProducts() {
		
		$http({
			method : "POST",
			url : '/getCart'
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
				var results = data.data;
				$scope.products = [ ];
				$scope.total = 0;
				var total = 0;
				var current = 0;
				for(var i=0; i < results.length; i++){
					current = (parseInt(results[i].price) + (isNaN(parseInt(results[i].ship_price))? 0 : parseInt(results[i].ship_price)))*parseInt(results[i].quantity);
					
					total = parseInt(total) + current;
					$scope.products.push(results[i]);
				}
				$scope.total = total;
				}
		}).error(function(error) {
		});
	};
	
	$scope.removeFromCart = function(id, quantity, price, ship_price, total){				
		var current = (parseInt(price) + parseInt(ship_price))*parseInt(quantity);
		total = total - current;
		
		$http({
			method : "POST",
			url : '/removeFromCart',
			data: {"prod_id": id}
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
				$scope.total = total;
				var index = -1;		
				var comArr = eval( $scope.products );
				for( var i = 0; i < comArr.length; i++ ) {
					if( comArr[i].prod_id === id ) {
						index = i;
						break;
					}
				}
				$scope.products.splice( index, 1 );	
				}
		}).error(function(error) {
		});
		
	};
	
	$scope.checkout = function (total) {
		if(total == "0" || total == undefined){
			alert("Nothing to checkout!");
		}
		else{
			$http({
				method : "POST",
				url : '/payment1',
				data: {"total": total}
			}).success(function(data) {
				if (data.statusCode == 401) {
					alert("Some error occurred, please login and try again");
					window.location.assign("/signOut");
				}
				else if (data.statusCode == 405) {
					alert("Please login first");
					window.location.assign("/signOut");
				}
				else{
					window.location.assign("/payment2");
				}
			}).error(function(error) {
			});
		}
	};
	
	$scope.init();
	
	$scope.displayPhone = function(name, price) {
		if($scope.quantity == undefined){
			alert("Please enter quantity");
		}
		else{
		$http({
			method : "POST",
			url : '/addToCart',
			data : {
				"name" : name,
				"price" : price,
				"quantity": $scope.quantity
			}
		}).success(function(data) {
			if (data.statusCode == 401) {
				alert("Some error occurred, please login and try again");
			}
			else
				{
				$scope.products.push({ 'name':name, 'price': price });
				$scope.count ++;
				$scope.total = data.total;
				}
		}).error(function(error) {
		});
		}
		
	}
	$scope.clearCart = function initProducts() {
		$http({
			method : "POST",
			url : '/clearCart'
		}).success(function(data) {
			if (data.statusCode == 401) {
			}
			else
				{
				$scope.products = data.data;
				$scope.total = data.total;
				}
		}).error(function(error) {
		});
	};
	
	$scope.displayProduct = function(prod_id) {
		window.location.assign("/productDetails?prod_id="+prod_id);
	}
	
})
