var lumensWall = angular.module('lumensWall');
var Config = Config;
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

		var url = Config.General.baseUrl+'auth/'+type,
        width = 800,
        height = 600,
        top = (window.outerHeight - height) / 2,
        left = (window.outerWidth - width) / 2,
        interval = 1000;

    var popup = $window.open(url, type+' Login', 'width=' + width + ',height=' + height + ',scrollbars = 0, top=' + top + ',left=' + left);
    var user = "";

  	window.addEventListener('message', function(event) {

      var origin = event.origin || event.originalEvent.origin;
        // IMPORTANT: Check the origin of the data!
      if (origin+"/" === Config.General.baseUrl) {
            // The data has been sent from your site

            // The data sent with postMessage is stored in event.data
            console.log(event.data);
            var user = event.data;
            if (user.accounts.length > 0) {
  						user.currentAccount = user.accounts[0].account_id;
  						user.currentUsername = user.accounts[0].fed_name;
  					}
  					User.set(user);
  					localStorage.setItem('user', JSON.stringify(user));
  					popup.close();
            if (user.tfa_enabled == 1) {
              $state.go('tfalogin');
            } else{
              $state.go('dashboard');
            }

      } else {
          // The data hasn't been sent from your site!
          // Be careful! Do not use it.
          console.log(event);
          console.log("not from site2");
          popup.close();
          alert("Invalid response. User not authenticated");
          return;
      }
    });


	};


});