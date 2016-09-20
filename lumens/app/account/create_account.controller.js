var lumensWall = angular.module('lumensWall');

lumensWall.controller('createAccountController', function($scope, $state, $http, $rootScope, Account) {
  if ($rootScope.currentUser.account_id) {
    event.preventDefault();
    $state.go('dashboard');
  }
  $scope.userData = {};
  $scope.linkData = {};
  $scope.tempUser = {};
  $scope.statusMsg = {};

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
      $scope.userSeed = data.content.data.seed;
      $scope.userAcct = data.content.data.account_id;
      // $scope.tempUser = data.content.data;
      var user = data.content.data;
      user.seed = "";
      localUser = JSON.stringify(user);
      //console.log(user);
      // console.log($scope.userSeed);
				
      // Set the stringified user data into local storage
      localStorage.setItem('user', localUser);

                // The user's authenticated state gets flipped to
                // true so we can now show parts of the UI that rely
                // on the user being logged in
                $rootScope.authenticated = true;

                $rootScope.currentUser = user;
                // $scope.userSeed = $scope.tempUser.seed;
                // $scope.userAcct = $scope.tempUser.account_id;

                
                angular.element('.mb-control-success').triggerHandler('click');
                

              })
    .error(function(data) {
      console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = data.content.message;
        // angular.element('.mb-control-error').triggerHandler('click');
    });
  };

  $scope.linkAccount = function() {
    $scope.linkData.id = $rootScope.currentUser.id;
    $scope.linkData.email = $rootScope.currentUser.email;
    $scope.linkData.token = $rootScope.currentUser.token;

    Account.link($scope.linkData)
    .success(function(data) {

      //console.log(data);
      data.content.data.authenticated = true;
      $scope.userSeed = data.content.data.seed;
      $scope.userAcct = data.content.data.account_id;
      // $scope.tempUser = data.content.data;
      var user = data.content.data;
      user.seed = "";
      localUser = JSON.stringify(user);
      //console.log(user);
      //console.log($scope.userSeed);
        
      // Set the stringified user data into local storage
      localStorage.setItem('user', localUser);

                // The user's authenticated state gets flipped to
                // true so we can now show parts of the UI that rely
                // on the user being logged in
                $rootScope.authenticated = true;

                $rootScope.currentUser = user;
                // $scope.userSeed = $scope.tempUser.seed;
                // $scope.userAcct = $scope.tempUser.account_id;
      

      
      angular.element('.mb-control-link-success').triggerHandler('click');
      $scope.linkData = {};

      })
    .error(function(data) {
      // console.log(data);
				// Display Error
        // angular.element('.mb-control-error').triggerHandler('click');
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