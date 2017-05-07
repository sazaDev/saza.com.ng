var lumensWall = angular.module('lumensWall');

lumensWall.controller('createAccountController', function($scope, $state, $http, $rootScope, Account, User) {
  // if ($rootScope.currentUser.account_id) {
  //   event.preventDefault();
  //   $state.go('dashboard');
  // }
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
    .success(function(data) {

      //console.log(data);
      data.content.data.authenticated = true;
      
      // store seed to display in browser
      $scope.userSeed = data.content.data.seed;
      $scope.userAcct = data.content.data.account_id;
      
      // set the currently active account
      if (data.content.data.accounts.length > 0) {
        data.content.data.currentAccount = data.content.data.accounts[0].account_id;
        data.content.data.currentUsername = data.content.data.accounts[0].fed_name;
      }


      var user = data.content.data;
      user.seed = "";
      user.account_id = "";
      // localUser = JSON.stringify(user);
      

      // Set the stringified user data into local storage
      // localStorage.setItem('user', localUser);

      // $rootScope.authenticated = true;

      // $rootScope.currentUser = user;
      // console.log("currentUser", $rootScope.currentUser);
        User.set(user);

        
        // Set the stringified user data into local storage
        localStorage.setItem('user', JSON.stringify(user));
        console.log("currentUser", User.get());
      angular.element('.mb-control-success').triggerHandler('click');
                

    })
    .error(function(data) {
      console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = data.content.message;
        
    });
  };

  $scope.linkAccount = function() {
    $scope.linkData.id = $rootScope.currentUser.id;
    $scope.linkData.email = $rootScope.currentUser.email;
    $scope.linkData.token = $rootScope.currentUser.token;

    Account.link($scope.linkData)
    .success(function(data) {

      
      data.content.data.authenticated = true;
      $scope.userSeed = data.content.data.seed;
      $scope.userAcct = data.content.data.account_id;
      
      // set the currently active account
      if (data.content.data.accounts.length > 0) {
        data.content.data.currentUsername = data.content.data.accounts[0].fed_name;
        data.content.data.currentAccount = data.content.data.accounts[0].account_id;
      }

      var user = data.content.data;
      user.seed = "";
      user.account_id = "";
      // localUser = JSON.stringify(user);
        
      // Set the stringified user data into local storage
      // localStorage.setItem('user', localUser);

      // $rootScope.authenticated = true;

      // $rootScope.currentUser = user;
      User.set(user);
      // Set the stringified user data into local storage
      localStorage.setItem('user', JSON.stringify(user));
      console.log("currentUser", User.get());
      angular.element('.mb-control-link-success').triggerHandler('click');
      $scope.linkData = {};

      })
    .error(function(data) {
      
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = data.content.message;
      $scope.linkData = {};
    });
  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };




});