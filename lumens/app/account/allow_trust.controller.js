var lumensWall = angular.module('lumensWall');

lumensWall.controller('allowTrustController', function($scope, $state, $http, $rootScope, Account, User) {
  
  $scope.trustData = {};
  $scope.statusMsg = false;
  
  

  $scope.init = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    $scope.trustData.authorize = true;
  };
  
  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.allowTrust = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    $scope.trustData.account_id = $rootScope.currentUser.currentAccount;
    
    
    Account.allowTrust($scope.trustData)
      .then(function(data) {

        // console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.trustData = {};
        window.scrollTo(0, 0);

      })
      .catch(function(data) {
        
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.trustData = {};
        window.scrollTo(0, 0);

        
      });
  };





});