var lumensWall = angular.module('lumensWall');

lumensWall.controller('userClaimLumensController', function($scope, $state, $http, $rootScope, Account, User) {

  $scope.userData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;


  $scope.init = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.rcvr_email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.assetType = 0;

  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.claimLumens = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.rcvr_email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;


    Account.userClaimLumens($scope.userData)
      .then(function(resp) {

        console.log("success",resp);
        var respContent = resp.data.content;
        respContent.data.authenticated = true;


        // set the currently active account
        if (respContent.data.accounts.length > 0) {
          respContent.data.currentAccount = respContent.data.accounts[0].account_id;
          respContent.data.currentUsername = respContent.data.accounts[0].fed_name;
        }


        var user = respContent.data;

        User.set(user);

        // Set the stringified user data into local storage
        localStorage.setItem('user', JSON.stringify(user));
        console.log("currentUser", User.get());

        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = respContent.message;
        window.scrollTo(0, 0);
        $state.go('dashboard', {}, {reload: true});

      })
      .catch(function(resp) {
        console.log("error",resp);
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        if (resp.content) {
          $scope.statusMsg.content = resp.content.message;
          $scope.$apply();
        } else{
          $scope.statusMsg.content = resp.data.content.message;
        }
        // $scope.userData = {};
        window.scrollTo(0, 0);


      });
  };


  $scope.isCustomAsset = function(type) {
    if (type == 4 || type == 12) {
      return true;
    } else{
      return false;
    }
  };




});