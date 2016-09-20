var lumensWall = angular.module('lumensWall');

lumensWall.controller('transactionsController', function($scope, $state, $http, $rootScope, Account) {
  
  $scope.txData = {};
  $scope.records = [];
  $scope.tempUser = {};
  $scope.showDetail = false;
  $scope.txItem = {};
  $scope.init = function() {
    $scope.getTransactions();
  };

  $scope.getTransactions = function() {
    Account.getTransactions($rootScope.currentUser.token)
    .success(function(data) {
      // console.log("data", data);
      $scope.records = data.content.data;
    })
    .error(function(data) {
       // console.log("Error", data);
		
    });
  };

  $scope.txDetail = function(tx) {
    $scope.txItem = tx;
    $scope.showDetail = true;
  };

  $scope.hideDetail = function() {
    $scope.showDetail = false;
    $scope.txItem = {};
  };







});