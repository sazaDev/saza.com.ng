var lumensWall = angular.module('lumensWall');

lumensWall.controller('savePassphraseController', function($scope, $state, $http, $rootScope, Account, User) {

console.log($rootScope.currentUser);
 if ($rootScope.currentUser.need_password === 0) {
          // event.preventDefault();
              $state.go('dashboard');
   }

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
    .then(function(resp) {

      console.log(resp);
      resp.data.content.data.authenticated = true;

      // set the currently active account
      if (resp.data.content.data.accounts.length > 0) {
        resp.data.content.data.currentAccount = resp.data.content.data.accounts[0].account_id;
        resp.data.content.data.currentUsername = resp.data.content.data.accounts[0].fed_name;
      }

      var user = resp.data.content.data;

      User.set(user);

      // Set the stringified user data into local storage
      localStorage.setItem('user', JSON.stringify(user));
      console.log("currentUser", User.get());
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = resp.data.content.message;
      $state.go('savepassphrase', {}, {reload: true});

    })
    .catch(function(data) {
      console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      if (data.content) {
        $scope.statusMsg.content = data.content.message;
      } else{
        $scope.statusMsg.content = data.data.content.message;
      }
      $scope.$apply();

    });
  };


  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };




});