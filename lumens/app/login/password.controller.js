var lumensWall = angular.module('lumensWall');

lumensWall.controller('passwordController', function($scope, $state, $http, $rootScope, $stateParams, Login) {
		$scope.token = false;
	$scope.init = function() {
		if ($stateParams.token) {
			console.log("token available");
			$scope.token = true;
		};
	};

	$scope.requestLink = function() {
		Login.requestLink($scope.userData)
			.success(function(data) {

				// console.log(data);
				$scope.success_heading = "Request Link Sent";
				$scope.success_msg = 'A password reset link has been sent to your email. Click on this link to reset your account password.	The link will expire in One(1) hour.';
				angular.element('.mb-control-success').triggerHandler('click');
			})
			.error(function(data) {
				// console.log(data);
				$scope.error_msg = data.content.message;
        angular.element('.mb-control-error').triggerHandler('click');
      });
	};

		$scope.resetPassword = function() {
		$scope.userData.token = $stateParams.token;
		Login.resetPassword($scope.userData)
			.success(function(data) {

				// console.log(data);
				$scope.success_heading = "Password reset successfully";
				$scope.success_msg = 'Password successfully reset. Please login to access account';
				$scope.showlogin = true;
				angular.element('.mb-control-success').triggerHandler('click');
			})
			.error(function(data) {
				// console.log(data);
				$scope.error_msg = data.content.message;
        angular.element('.mb-control-error').triggerHandler('click');
      });
	};




});