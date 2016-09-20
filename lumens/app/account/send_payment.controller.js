var lumensWall = angular.module('lumensWall');

lumensWall.controller('sendPaymentController', function($scope, $state, $http, $rootScope, Account) {
  
  $scope.paymentData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;
  

  $scope.init = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    
  };
  
  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.sendPayment = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    Account.sendPayment($scope.paymentData)
      .success(function(data) {

        // console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.paymentData = {};

        
        // angular.element('.mb-control-success').triggerHandler('click');
                

      })
      .error(function(data) {
        // console.log("error",data);
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.paymentData = {};
				// Display Error
        // angular.element('.mb-control-error').triggerHandler('click');
      });
  };







});