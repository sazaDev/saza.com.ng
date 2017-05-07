var lumensWall = angular.module('lumensWall');

lumensWall.controller('setUsernameController', function($scope, $state, $http, $rootScope, Account) {
  
  $scope.userData = {};
  $scope.statusMsg = {};
  // $scope.userRegex = "/[a-z0-9][^<*,>]+/i";
  $scope.userRegex = /^()[a-z0-9][^<*,|>]+$/i;
  
  $scope.init = function() {

  };
  
  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.setUsername = function() {

    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;

    Account.setUsername($scope.userData)
    .success(function(data) {
  
      
      $rootScope.currentUser.currentUsername = $scope.userData.username+"*"+$rootScope.siteURL;
      // save in accounts array as well

      $rootScope.currentUser.accounts.forEach(function(a) {
        if (a.account_id === $rootScope.currentUser.currentAccount) {
          a.fed_name = $scope.userData.username+"*"+$rootScope.siteURL;
        }
      });

      console.log("currentUser", $rootScope.currentUser);
      localStorage.setItem('user', JSON.stringify($rootScope.currentUser));

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