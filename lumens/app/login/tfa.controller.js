var lumensWall = angular.module('lumensWall');

lumensWall.controller('tfaController', function($scope, $state, $window, $interval, $http, $rootScope, Login, User) {
	$scope.responseData = {};
	// $window.$scope = $scope;//set popup window scope to controller scope

	$scope.init = function() {
		// body...
	};

	$scope.loginUser = function() {
    $scope.userData.token = $rootScope.currentUser.token;
		Login.tfaLogin($scope.userData)
			.success(function(data) {

				console.log(data);
				data.user.authenticated = true;

				if (data.user.accounts.length > 0) {
					data.user.currentAccount = data.user.accounts[0].account_id;
					data.user.currentUsername = data.user.accounts[0].fed_name;
				}

        User.set(data.user);

        var user = JSON.stringify(data.user);
        localStorage.setItem('user', user);

        // Everything worked out so we can now redirect to
        // the users state to view the data
        $state.go('dashboard');
			})
			.error(function(data) {

				$scope.responseData = data;

        angular.element('.mb-control-error').triggerHandler('click');
      });
	};


});