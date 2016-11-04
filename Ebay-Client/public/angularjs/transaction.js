var trans = angular.module('transaction', []);

trans.controllers

trans.controller('transaction', function($scope, $http) {
	
	$scope.cartProducts = [ ];
	
$scope.init = function initProducts() {
		$http({
			method : "POST",
			url : '/productDetails',
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
				var results = data.data;
				alert(results);
				$scope.data.push(data.data);
				//$scope.data = data.data;
				}
		}).error(function(error) {
		});
	};
	$scope.init();
	
	$scope.removeFromCart = function(id){				
		var index = -1;		
		var comArr = eval( $scope.products );
		for( var i = 0; i < comArr.length; i++ ) {
			if( comArr[i].id === id ) {
				index = i;
				break;
			}
		}
		if( index === -1 ) {
			alert( "Something gone wrong" );
		}
		$scope.products.splice( index, 1 );		
	};
	
	//$scope.invalid_user = true;
	$scope.addToCart = function(brand, label, canditions, price, ship_price,prod_id) {
		if($scope.quantity == undefined){
			alert("Please enter quantity");
		}
		else{
		var dPrice = ship_price;
		var cartData = JSON.stringify({ 'brand':brand,'label': label, 'price': price,'condition':canditions, 'deliveryPrice':dPrice, 'quantity':$scope.quan, 'id':prod_id });
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
					if(parseInt(data.quantity)>=parseInt($scope.quan))
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
			if (data.statusCode == 401) {
			}
			else if (data.statusCode == 402) {
			}
			else
				{
				alert("bid submitted");
				window.location.assign("/loggedIn");
				}
		}).error(function(error) {
		});
	};
	}
	
	
	$scope.buyNow = function (prod_id) {
			
		window.location.assign("/quickCheckout?prod_id="+prod_id);
		}

	
	})
