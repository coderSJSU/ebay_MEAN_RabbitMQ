var paymentAdd = angular.module('paymentAdd', []);

paymentAdd.controllers

paymentAdd.controller('paymentAdd', function($scope, $http) {
	
$scope.submit = function() {
	var f_name = $scope.f_name;
	var l_name = $scope.l_name;
	var phone = $scope.phone;
	var address = $scope.address;
	var city = $scope.city;
	var country = $scope.country;
	
	if($scope.f_name == undefined || $scope.f_name==null || $scope.f_name=="")
		alert("Enter First Name");
	else if($scope.l_name == undefined || $scope.l_name=="")
		alert("Enter Last Name");
	else if($scope.phone == undefined || $scope.phone=="")
		alert("Enter Phone Number");
	else if($scope.address == undefined || $scope.address=="")
		alert("Enter address");
	else if($scope.city == undefined || $scope.city==null || $scope.city=="")
		alert("Enter City");
	else if($scope.country == undefined || $scope.country==null || $scope.country=="")
		alert("Enter Country");
	else{
		window.location.assign("/paymentGateway");
	}
	};
	
	$scope.submitNow = function() {
		var f_name = $scope.f_name;
		var l_name = $scope.l_name;
		var phone = $scope.phone;
		var address = $scope.address;
		var city = $scope.city;
		var country = $scope.country;
		
		if($scope.f_name == undefined || $scope.f_name==null || $scope.f_name=="")
			alert("Enter First Name");
		else if($scope.l_name == undefined || $scope.l_name=="")
			alert("Enter Last Name");
		else if($scope.phone == undefined || $scope.phone=="")
			alert("Enter Phone Number");
		else if($scope.address == undefined || $scope.address=="")
			alert("Enter address");
		else if($scope.city == undefined || $scope.city==null || $scope.city=="")
			alert("Enter City");
		else if($scope.country == undefined || $scope.country==null || $scope.country=="")
			alert("Enter Country");
		else{
			window.location.assign("/urgentPayment");
		}
		};	
	
	
	
})
