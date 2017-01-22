var lumensWall = angular.module('lumensWall');

lumensWall.controller('setOptionsController', function($scope, $state, $http, $rootScope, Account, User) {
  
  $scope.userData = {};
  $scope.statusMsg = false;
  
  

  $scope.init = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    
    
  };
  
  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.setOptions = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;
    
    if ($scope.userData.signerKey || $scope.userData.signerWeight) {
      // check asset details 
      if (!$scope.userData.signerKey || !$scope.userData.signerWeight) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Signer key and weight pair  required'];
        window.scrollTo(0, 0);
        return null;
      } 
    } 

    Account.setOptions($scope.userData)
      .success(function(data) {

        // console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.userData = {};
        window.scrollTo(0, 0);

      })
      .error(function(data) {
        
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.userData = {};
        window.scrollTo(0, 0);

        
      });
  };


});