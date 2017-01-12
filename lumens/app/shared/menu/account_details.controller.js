var lumensWall = angular.module('lumensWall');

lumensWall.controller('accountDetailsController', function($scope, $state, $http, $rootScope, User) {
	
	$scope.init = function() {
        console.log("currentUser", $rootScope.currentUser);
		// $scope.currentAccount = $rootScope.currentUser.currentAccount;

	};

	$scope.changeCurrentAccount = function (ca) {
    console.log("before cca", $rootScope.currentUser.currentAccount);
    $rootScope.currentUser.currentAccount = ca;
    console.log("ca", ca);
    console.log("after cca", $rootScope.currentUser.currentAccount);

    User.setCurrentAccount(ca);

    var user = User.get();
    localStorage.setItem('user', JSON.stringify(user));
    
    $state.go('dashboard', {}, {reload: true});
  };

});