var paymentFinal = angular.module('paymentFinal', []);

paymentFinal.controllers

paymentFinal.controller('paymentFinal', function($scope, $http) {
	
$scope.init = function() {
	$http({
		method : "POST",
		url : '/getCartAmount'
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
			$scope.total = 0;
			var total = 0;
			var current = 0;
			for(var i=0; i < results.length; i++){
				current = (parseInt(results[i].price) + parseInt(results[i].deliveryPrice))*parseInt(results[i].quantity);
				total = parseInt(total) + current;
			}
			$scope.total = total;

			}
	}).error(function(error) {
	});
};

$scope.init()
	
	
$scope.submit = function() {
	var cardNum = $scope.cNumber;
	var expiryDate = $scope.expDate
	var cvv = $scope.cvv;
	
	//var patt = new RegExp("\d{16}");
    //var res = patt.test(cardNum);
	var res = cardNum.match(/^\d{16}$/)
	
    if(cardNum == undefined || cardNum==null || cardNum=="")
		alert("Enter Card Number");
    else if(res=="" || res == undefined || res==null)
    	alert("Card number should be 16 digits");
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
				method : "POST",
				url : '/emptyCart'
			}).success(function(data) {
				if (data.statusCode == 401) {
					$scope.invalid_login = false;
					$scope.validlogin = true;
				}
				else if (data.statusCode == 405) {
					alert("Some error occurred");
					window.location.assign("/signin");
				}
				else
					{
					alert("Success");
					window.location.assign("/loggedIn");
					}
			}).error(function(error) {
			});
		}
	}
	};
	
	
	
})
