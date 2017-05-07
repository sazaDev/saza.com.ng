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
      .success(function(data) {

        console.log("success",data);
        // show success message
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
        window.scrollTo(0, 0);
        $state.go('dashboard', {}, {reload: true});
        
      })
      .error(function(data) {
        
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
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