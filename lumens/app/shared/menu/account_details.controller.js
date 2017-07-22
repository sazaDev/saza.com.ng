var lumensWall = angular.module('lumensWall');


lumensWall.controller('accountDetailsController', function($scope, $state, $http, $rootScope, User) {
	
	$scope.init = function() {
        console.log("currentUser", $rootScope.currentUser);
		// $scope.currentAccount = $rootScope.currentUser.currentAccount;

	};

	$scope.changeCurrentAccount = function (ca) {
    
    $rootScope.currentUser.currentAccount = ca;
    $rootScope.currentUser.accounts.forEach(function(a) {
        if (a.account_id === ca) {
          $rootScope.currentUser.currentUsername = a.fed_name;
        }
      });

    User.setCurrentAccount(ca);

    var user = User.get();
    user.currentUsername = $rootScope.currentUser.currentUsername;

    localStorage.setItem('user', JSON.stringify(user));
    
    $state.go('dashboard', {}, {reload: true});
  };

});