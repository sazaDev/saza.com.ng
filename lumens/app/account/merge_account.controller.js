var lumensWall = angular.module('lumensWall');

lumensWall.controller('mergeAccountController', function($scope, $state, $http, $rootScope, Account) {

  $scope.userData = {};
  $scope.statusMsg = false;
  $scope.init = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;
  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.mergeAccount = function() {

    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;

    Account.mergeAccount($scope.userData)
    .success(function(data) {

      // console.log(data);

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;

      // angular.element('.mb-control-success').triggerHandler('click');


    })
    .error(function(data) {
      // console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = data.content.message;
      // angular.element('.mb-control-error').triggerHandler('click');
    });
  };







});