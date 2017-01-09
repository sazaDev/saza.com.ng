var lumensWall = angular.module('lumensWall');

lumensWall.controller('loginController', function($scope, $state, $http, $rootScope, Login) {
			$scope.responseData = {};

	$scope.init = function() {
		// body...
	};

	$scope.loginUser = function() {
		Login.login($scope.userData)
			.success(function(data) {

				// console.log(data);
				data.user.authenticated = true;
				// set the currently active account
				
				if (data.user.accounts.length > 0) {
					data.user.currentAccount = data.user.accounts[0].account_id;
				}
				
				var user = JSON.stringify(data.user);
				
				// Set the stringified user data into local storage
        localStorage.setItem('user', user);
        $rootScope.authenticated = true;

        // Putting the user's data on $rootScope allows
        // us to access it anywhere across the app
        $rootScope.currentUser = data.user;
        
        console.log("currentUser", $rootScope.currentUser);
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