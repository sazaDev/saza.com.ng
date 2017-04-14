var lumensWall = angular.module('lumensWall');

lumensWall.controller('savePassphraseController', function($scope, $state, $http, $rootScope, Account, User) {

console.log($rootScope.currentUser);
 if ($rootScope.currentUser.need_password == 0) {
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
    .success(function(data) {

      //console.log(da
      data.content.data.authenticated = true;
      
      // store seed to display in browser
      // $scope.userSeed = data.content.data.seed;
      // $scope.userAcct = data.content.data.account_id;
      
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
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
      // angular.element('.mb-control-success').triggerHandler('click');
                

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