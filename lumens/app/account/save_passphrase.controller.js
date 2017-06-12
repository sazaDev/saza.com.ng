var lumensWall = angular.module('lumensWall');

lumensWall.controller('savePassphraseController', function($scope, $state, $http, $rootScope, Account, User) {

console.log($rootScope.currentUser);
 // if ($rootScope.currentUser.need_password == 0) {
 //          // event.preventDefault();
 //              $state.go('dashboard');
 //   }

  $scope.userData = {};
  $scope.linkData = {};
  $scope.tempUser = {};
  $scope.statusMsg = false;

  $scope.init = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;

  };

  $scope.changePassword = function() {
    Account.savePassphrase($scope.userData)
    .success(function(data) {

      data.content.data.authenticated = true;

      // set the currently active account
      if (data.content.data.accounts.length > 0) {
        data.content.data.currentAccount = data.content.data.accounts[0].account_id;
        data.content.data.currentUsername = data.content.data.accounts[0].fed_name;
      }

      var user = data.content.data;

      User.set(user);

      // Set the stringified user data into local storage
      localStorage.setItem('user', JSON.stringify(user));
      console.log("currentUser", User.get());
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;

    })
    .error(function(data) {
      console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = data.content.message;

    });
  };


  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };




});