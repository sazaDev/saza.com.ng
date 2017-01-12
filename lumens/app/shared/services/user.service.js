// user service

var user = angular.module('userService', []);


user.factory('User', function(){
	var currentUser = {};
	currentUser.currentAccount = "";
	currentUser.setCurrentAccount = function(account_id) {
		currentUser.currentAccount = account_id;
	};

	currentUser.getCurrentAccount = function() {
		return currentUser.currentAccount;
	};

	currentUser.set = function(account) {
		currentUser = account;
	};

	currentUser.get = function() {
		return currentUser;
	};

	return currentUser;

});