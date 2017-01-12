var lumensWall = angular.module('lumensWall');

lumensWall.controller('loginController', function($scope, $state, $window, $interval, $http, $rootScope, Login, User) {
	$scope.responseData = {};
	// $window.$scope = $scope;//set popup window scope to controller scope
	
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
				
				// var user = JSON.stringify(data.user);
				
				// Set the stringified user data into local storage
        // localStorage.setItem('user', user);
        // $rootScope.authenticated = true;

        // Putting the user's data on $rootScope allows
        // us to access it anywhere across the app
        // $rootScope.currentUser = data.user;
        User.set(data.user);
        console.log("currentUser", User.get());

        var user = JSON.stringify(data.user);
				
				// Set the stringified user data into local storage
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


	$scope.socialLogin = function(type) {

		var url = 'http://localhost:8888/auth/'+type,
        width = 800,
        height = 600,
        top = (window.outerHeight - height) / 2,
        left = (window.outerWidth - width) / 2,
        interval = 1000;

    var popup = $window.open(url, type+' Login', 'width=' + width + ',height=' + height + ',scrollbars = 0, top=' + top + ',left=' + left);


 		var i = $interval(function(){
      interval += 500;
      try {

       if (popup.value){
       		console.log("popup value", popup.value);
       		User.set(popup.value);
       		var user = JSON.stringify(popup.value);
				
					// Set the stringified user data into local storage
        	localStorage.setItem('user', user);
          $interval.cancel(i);
          popup.close();
          $state.go('dashboard');
        }
      } catch(e){
        console.error(e);
      }
    }, interval);        
		

	};

});