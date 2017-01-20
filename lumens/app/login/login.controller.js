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
					data.user.currentUsername = data.user.accounts[0].fed_name;
				}
				
				// var user = JSON.stringify(data.user);
				
				// Set the stringified user data into local storage
        // localStorage.setItem('user', user);
        // $rootScope.authenticated = true;

        // Putting the user's data on $rootScope allows
        // us to access it anywhere across the app
        // $rootScope.currentUser = data.user;
        User.set(data.user);
        // console.log("currentUser", User.get());

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


 		// var i = $interval(function(){
   //    interval += 500;
   //    try {

   //     if (popup.value){
   //     		console.log("popup value", popup.value);
   //     		popup.value.authenticated = true;
			// 		// set the currently active account
				
			// 		if (popup.value.accounts.length > 0) {
			// 			popup.value.currentAccount = popup.value.accounts[0].account_id;
			// 			popup.value.currentUsername = popup.value.accounts[0].fed_name;
			// 		}

   //     		User.set(popup.value);
   //     		var user = JSON.stringify(popup.value);
				
			// 		// Set the stringified user data into local storage
   //      	localStorage.setItem('user', user);
   //        $interval.cancel(i);
   //        popup.close();
   //        $state.go('dashboard');
   //      }
   //    } catch(e){
   //      console.error(e);
   //    }
   //  }, interval);        
	
		window.addEventListener('message', function(event) {

    var origin = event.origin || event.originalEvent.origin;
      // IMPORTANT: Check the origin of the data! 
    if (origin === 'https://saza.com.ng:8888') {
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
					$state.go('dashboard');

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