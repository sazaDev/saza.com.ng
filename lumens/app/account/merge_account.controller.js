var lumensWall = angular.module('lumensWall');

lumensWall.controller('mergeAccountController', function($scope, $state, $http, $rootScope, Account) {
  
  $scope.userData = {};
  $scope.statusMsg = {};
  $scope.init = function() {

  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.mergeAccount = function() {
    
    $scope.userData.token = $rootScope.currentUser.token;

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