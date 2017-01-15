var lumensWall = angular.module('lumensWall');

lumensWall.controller('registerController', function($scope, $state, $http, $window, $interval, randomString, $rootScope, Login, User) {
		
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
       		popup.value.authenticated = true;
					// set the currently active account
				
					if (popup.value.accounts.length > 0) {
						popup.value.currentAccount = popup.value.accounts[0].account_id;
						popup.value.currentUsername = popup.value.accounts[0].fed_name;
					}
       		
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