var lumensWall = angular.module('lumensWall');

lumensWall.controller('claimEmailTxController', function($scope, $state, $http, $rootScope, $stateParams, Account) {
	if ($rootScope.currentUser) {
		$state.go('dashboard', {}, {reload: true});
	};

	$scope.token = false;
	$scope.init = function() {

	};


	$scope.claimLumens = function() {

		Account.claimLumens($scope.userData)
			.success(function(data) {

				// console.log(data);
				$scope.success_heading = "Your Claim was successful";
				$scope.success_msg = ' Please login to access account';
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