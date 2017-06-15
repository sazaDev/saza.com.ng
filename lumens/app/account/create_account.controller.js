var lumensWall = angular.module('lumensWall');

lumensWall.controller('createAccountController', function($scope, $state, $http, $rootScope, Account, User) {

  $scope.userData = {};
  $scope.linkData = {};
  $scope.tempUser = {};
  $scope.statusMsg = false;

  $scope.init = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userSeed = "aa";
    $scope.userAcct = "aa";
  };

  $scope.createAccount = function() {
    Account.create($scope.userData)
    .then(function(resp) {

      console.log(resp);
      var respContent = resp.data.content;

      respContent.data.authenticated = true;


      $scope.userSeed = Utility.decrypt(respContent.data.seed, $scope.userData.tx_passphrase);
      $scope.userAcct = respContent.data.account_id;

      // set the currently active account
      if (respContent.data.accounts.length > 0) {
        respContent.data.currentAccount = respContent.data.accounts[0].account_id;
        respContent.data.currentUsername = respContent.data.accounts[0].fed_name;
      }


      var user = respContent.data;
      user.seed = "";
      user.account_id = "";
      User.set(user);

      // Set the stringified user data into local storage
      localStorage.setItem('user', JSON.stringify(user));
      console.log("currentUser", User.get());
      angular.element('.mb-control-success').triggerHandler('click');


    })
    .catch(function(resp) {
      console.log(resp);
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

  $scope.linkAccount = function() {
    $scope.linkData.id = $rootScope.currentUser.id;
    $scope.linkData.email = $rootScope.currentUser.email;
    $scope.linkData.token = $rootScope.currentUser.token;

    Account.link($scope.linkData)
    .then(function(resp) {

      console.log(resp);
      var respContent = resp.data.content;
      respContent.data.authenticated = true;

      $scope.userSeed = $scope.linkData.seed;
      $scope.userAcct = respContent.data.account_id;

      // set the currently active account
      if (respContent.data.accounts.length > 0)
      {
        respContent.data.currentUsername = respContent.data.accounts[0].fed_name;
        respContent.data.currentAccount = respContent.data.accounts[0].account_id;
      }

      var user = respContent.data;
      user.seed = "";
      user.account_id = "";
      User.set(user);


      // Set the stringified user data into local storage
      localStorage.setItem('user', JSON.stringify(user));
      console.log("currentUser", User.get());
      angular.element('.mb-control-link-success').triggerHandler('click');
      $scope.linkData = {};

    })
    .catch(function(resp) {

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      if (resp.content) {
        $scope.statusMsg.content = resp.content.message;
      } else{
        $scope.statusMsg.content = resp.data.content.message;
      }

      $scope.$apply();
      $scope.linkData = {};

    });
  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };




});