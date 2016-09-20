var lumensWall = angular.module('lumensWall');

lumensWall.controller('logoutController', function($scope, $state, $http, $rootScope, Login) {
	
	$scope.logout = function() {
		localStorage.removeItem('user');
    $state.go('login', {message: "Login Expired. Please sign in"});
	};

		

});