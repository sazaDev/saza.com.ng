var lumensWall = angular.module('lumensWall');

lumensWall.controller('transactionsController', function($scope, $state, $http, $rootScope, Account, DTOptionsBuilder) {
  
  $scope.txData = {};
  $scope.records = [];
  $scope.tempUser = {};
  $scope.showDetail = false;
  $scope.txItem = {};
  $scope.dtOptions = "";

  $scope.init = function() {
    $scope.getTransactions();

  };



  $scope.getTransactions = function() {

    Account.getTransactions($rootScope.currentUser.token, $rootScope.currentUser.currentAccount)
    .success(function(data) {
      // console.log("data", data);
      $scope.records = data.content.data;
      console.log($scope.records);
      $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('aaSorting', [[0, 'desc']]);
    })
    .error(function(data) {
       console.log("Error", data);
		
    });
  };

  $scope.txDetail = function(tx) {
    $scope.txItem = tx;
    $scope.txItem.textArray = $scope.txItem.text.split('\n');
    console.log($scope.txItem.textArray);
    $scope.showDetail = true;
  };

  $scope.hideDetail = function() {
    $scope.showDetail = false;
    $scope.txItem = {};
  };







});