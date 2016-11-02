var profile = angular.module('profile', []);

profile.controllers

profile.controller('profile', function($scope, $http) {
	
$scope.init = function init() {
		
		$scope.totalBought = 0;
		$scope.totalForSale = 0;
		$http({
			method : "POST",
			url : '/getItemsForSale'
		}).success(function(data) {
			if (data.statusCode == 401) {
				$scope.invalid_login = false;
				$scope.validlogin = true;
			}
			else if (data.statusCode == 405) {
				alert("Login First to view profile");
				window.location.assign("/signin");
			}
			else
				{
				var results = data.data;
				$scope.productsForSale = [ ];
				$scope.totalForSale = 0;
				var total1 = 0;
				var count = 0;
				for(var i=0; i < results.length; i++){
					count = count + 1 ;
					$scope.productsForSale.push(results[i]);
				}
				$scope.totalForSale = count;
				}
		}).error(function(error) {
		});
		
		
		$http({
			method : "GET",
			url : '/getItemsBought'
		}).success(function(data) {
			if (data.statusCode == 401) {
			}
			else if (data.statusCode == 405) {
				alert("Login First to vew cart");
				window.location.assign("/signin");
			}
			else
				{
				var results = data.data;
				$scope.productsBought = [ ];
				$scope.totalBought = 0;
				var total1 = 0;
				var count = 0;
				for(var i=0; i < results.length; i++){
					count = count + 1 ;
					$scope.productsBought.push(results[i]);
				}
				$scope.totalBought = count;
				}
		}).error(function(error) {
		});
		
		getUserInfo();
	};
	
	$scope.init();
	
	function getUserInfo() {
		$http({
			method : "GET",
			url : '/getUserInfo'
		}).success(function(data) {
			if (data.statusCode == 401) {
			}
			else if (data.statusCode == 405) {
				alert("Login First to vew profile");
				window.location.assign("/signin");
			}
			else
				{
				var results = data.data;
					$scope.first_nm = results.firstName;
					$scope.last_nm = results.lastName;
					$scope.address = results.address;
					$scope.month = results.month;
					$scope.day = results.day;
					$scope.year = results.year;
					$scope.city = results.city;
					$scope.country = results.country;
					$scope.email_id = results.email;
				}
		}).error(function(error) {
		});
	
	};
	
$scope.submit = function submit() {
		
	$http({
		method : "POST",
		url : '/saveProfile',
		data : {
			"month" : $scope.month,
			"year" : $scope.year,
			"day": $scope.day,
			"address": $scope.address,
			"city": $scope.city,
			"country": $scope.country,
			"first_nm": $scope.first_nm,
			"last_nm": $scope.last_nm,
			"email_id": $scope.email_id
		}
	}).success(function(data) {
		//checking the response data for statusCode
		if (data.statusCode == 200 ) {
			alert("Details Updated");
		}
		else
			{
			alert("Error updating customer details. Please try again");
			}
	}).error(function(error) {
	});
	};
	
	
})
