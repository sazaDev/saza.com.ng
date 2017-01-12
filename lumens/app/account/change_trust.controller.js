var lumensWall = angular.module('lumensWall');

lumensWall.controller('changeTrustController', function($scope, $state, $http, $rootScope, Account, User) {
  
  $scope.trustData = {};
  $scope.statusMsg = false;
  
  

  $scope.init = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    // $scope.trustData.assetType = 4;
    
  };
  
  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.changeTrust = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    $scope.trustData.account_id = $rootScope.currentUser.currentAccount;
    
    if ($scope.trustData.assetType > 0) {
      // check asset details 
      if (!$scope.trustData.assetCode || !$scope.trustData.assetIssuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Asset details required'];
        window.scrollTo(0, 0);
        return null;
      } 
    } 

    Account.changeTrust($scope.trustData)
      .success(function(data) {

        // console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.trustData = {};

      })
      .error(function(data) {
        
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.trustData = {};
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