var lumensWall = angular.module('lumensWall');

lumensWall.controller('activateController', function($scope, $state, $http, $rootScope, $stateParams, Login) {
		
	$scope.init = function() {
	$scope.status = 'Activating...';
	$scope.userData = {};
	$scope.activateUser();

	};

	$scope.activateUser = function() {
		$scope.userData.email = $stateParams.email;
		$scope.userData.activation_key = $stateParams.activation_key;

		Login.activateUser($scope.userData)
			.success(function(data) {

				// console.log(data);
				$scope.status = data.content.message[0];
				
			
			})
			.error(function(data) {
				// console.log(data);
				$scope.status = data.content.message[0];
				// Display Error
        // angular.element('.mb-control-error').triggerHandler('click');
      });
	};




});