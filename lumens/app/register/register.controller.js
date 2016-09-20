var lumensWall = angular.module('lumensWall');

lumensWall.controller('registerController', function($scope, $state, $http, randomString, $rootScope, Login) {
		
	$scope.userData = {};
	$scope.responseData = {};

	$scope.init = function() {
		
	};

	$scope.registerUser = function () {
		$scope.userData.activationKey = randomString(32);
		// console.log($scope.userData);
		Login.register($scope.userData)
			.success(function(data) {

				// console.log(data);
        angular.element('.mb-control-success').triggerHandler('click');
				
			})
			.error(function(data) {
				// console.log(data);
				$scope.responseData = data;
                angular.element('.mb-control-error').triggerHandler('click');



		});
	};

});