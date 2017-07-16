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
    .then(function(resp) {

      console.log("success",resp);
      var respContent = resp.data.content;

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
      $scope.statusMsg.content = respContent.message;




    })
    .catch(function(resp) {
      console.log("error",resp);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
       if (resp.content) {
        $scope.statusMsg.content = resp.content.message;
      } else{
        $scope.statusMsg.content = resp.data.content.message;
      }

      $scope.$apply();


    });
  };







});