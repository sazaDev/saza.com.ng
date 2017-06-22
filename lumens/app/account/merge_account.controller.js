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
    .then(function(resp) {

      console.log(resp);

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = resp.data.content.message;
      window.scrollTo(0, 0);

    })
    .catch(function(resp) {
      console.log(resp);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      if (resp.content) {
        $scope.statusMsg.content = resp.content.message;
        $scope.$apply();
      } else{
        $scope.statusMsg.content = resp.data.content.message;
      }
      window.scrollTo(0, 0);

    });
  };







});