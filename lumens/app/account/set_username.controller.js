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
    
    $scope.userData.token = $rootScope.currentUser.token;

    Account.setUsername($scope.userData)
    .success(function(data) {
  
      // console.log(data);
      data.content.user.authenticated = true;
      var user = JSON.stringify(data.content.user);
      // console.log(user);
      // Set the stringified user data into local storage
      localStorage.setItem('user', user);

      // The user's authenticated state gets flipped to
      // true so we can now show parts of the UI that rely
      // on the user being logged in
      $rootScope.authenticated = true;

      // Putting the user's data on $rootScope allows
      // us to access it anywhere across the app
      $rootScope.currentUser = data.content.user;
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