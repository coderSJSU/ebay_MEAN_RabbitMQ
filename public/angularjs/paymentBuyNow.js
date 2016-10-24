var paymentBuyNow = angular.module('paymentBuyNow', []);

paymentBuyNow.controllers

paymentBuyNow.controller('paymentBuyNow', function($scope, $http) {
	
$scope.init = function() {
	$http({
		method : "POST",
		url : '/getAmount'
	}).success(function(data) {
		if (data.statusCode == 401) {
		}
		else if (data.statusCode == 405) {
			alert("Login First");
			window.location.assign("/signin");
		}
		else
			{
			var bidAmount = 0;
			if(data.bid.length> 0)
				bidAmount = data.bid[0].max;
			else{
				
				alert("Some error occurred");
			}
			$scope.bidAmount = bidAmount;

			}
	}).error(function(error) {
	});
};

$scope.init();
	
	
$scope.submit = function() {
	var cardNum = $scope.cNumber;
	var expiryDate = $scope.expDate
	var cvv = $scope.cvv;
	
	//
	if(cardNum == undefined || cardNum==null || cardNum=="")
		alert("Enter Card Number");
	else if(expiryDate == undefined || expiryDate=="")
		alert("Enter Expiry date");
	else if(cvv == undefined || cvv=="")
		alert("Enter CVV");
	else{
		var cal = expiryDate.split("-");
		var inputMonth = cal[0];
		var inputYear = cal[1];
		var dateObj = new Date();
		var month = dateObj.getUTCMonth() + 1; //months from 1-12
		var day = dateObj.getUTCDate();
		var year = dateObj.getUTCFullYear();
		if(inputYear>year){
			$http({
				method : "GET",
				url : '/sold'
			}).success(function(data) {
				if (data.statusCode == 401) {
				}
				else if (data.statusCode == 405) {
					alert("Some error occurred");
					window.location.assign("/signin");
				}
				else
					{
					alert("Success! Added to your collection");
					window.location.assign("/loggedIn");
					}
			}).error(function(error) {
			});
		}
	}
	};
	
	
	
})
