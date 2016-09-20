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
				var user = JSON.stringify(data.user);
				// console.log(user);
				// Set the stringified user data into local storage
        localStorage.setItem('user', user);

        // The user's authenticated state gets flipped to
        // true so we can now show parts of the UI that rely
        // on the user being logged in
        $rootScope.authenticated = true;

        // Putting the user's data on $rootScope allows
        // us to access it anywhere across the app
        $rootScope.currentUser = data.user;
        //console.log($rootScope.currentUser);
        // Everything worked out so we can now redirect to
        // the users state to view the data
        $state.go('dashboard');
        // angular.element('.mb-control-success').triggerHandler('click');
        // store user details in local storage
        // redirect to dashboard or settings
			
			})
			.error(function(data) {
				// console.log(data);
					$scope.responseData = data;
				// Display Error
        angular.element('.mb-control-error').triggerHandler('click');
      });
	};




});