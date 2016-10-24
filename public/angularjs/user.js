//loading the 'login' angularJS module
var user = angular.module('user', []);
//defining the login controller
user.controllers

user.controller('user', function($scope, $http) {
	
	$scope.invalid_user = true;
	$scope.checkUser = function() {
		if(!($scope.email== undefined || $scope.password == undefined)){
		$http({
			method : "POST",
			url : '/checkUser',
			data : {
				"email" : $scope.email,
				"password" : $scope.password
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode == 401) {
				$scope.invalid_user = false;
			}
			else if (data.statusCode == 402) {
				$scope.invalid_user = false;
			}
			else
				{
				$scope.invalid_travel = true;
				window.location.assign("/loggedIn");
				}
		}).error(function(error) {
			$scope.validlogin = true;
			$scope.invalid_login = true;
		});
	};
	}
	$scope.removeRow = function(id){				
		var index = -1;		
		var comArr = eval( $scope.flights );
		for( var i = 0; i < comArr.length; i++ ) {
			if( comArr[i].id === id ) {
				index = i;
				break;
			}
		}
		if( index === -1 ) {
			alert( "Something gone wrong" );
		}
		$scope.flights.splice( index, 1 );		
	};
	
	$scope.register = function() {
		var email = $scope.email;
		var reemail = $scope.reemail;
		var firstName = $scope.firstName;
		var lastName = $scope.lastName;
		var password = $scope.password;
		
		if(($scope.email == "" || $scope.password == "" || $scope.reemail == "" || $scope.firstName == "" || $scope.tel == "" ||
				$scope.email == undefined || $scope.password == undefined || $scope.reemail == undefined || $scope.firstName == undefined || $scope.tel == undefined)){
			alert("Enter Mandatory details");
		}
		else if(!($scope.email == $scope.reemail)){
			alert("Both emails should be same");
		}
		else{
		$http({
			method : "POST",
			url : '/register',
			data : {
				"email" : $scope.email,
				"password" : $scope.password,
				"firstname": firstName,
				"lastname": lastName,
				"tel": $scope.tel
			}
		}).success(function(data) {
			if (data.statusCode == 401) {
				alert("email already exists");
			}
			else if (data.statusCode == 402) {
				alert("Some Error occurred. Please retry later!");
			}
			else
				{
				$scope.invalid_travel = true;
				window.location.assign("/loggedIn");
				}
		}).error(function(error) {
		});
		}
	}	
	})
