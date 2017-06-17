var lumensWall = angular.module('lumensWall');

lumensWall.controller('emailTxController', function($scope, $state, $http, $rootScope, Account) {

  $scope.paymentData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;


  $scope.init = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    $scope.paymentData.assetType = 0;

  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.sendPayment = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    $scope.paymentData.account_id = $rootScope.currentUser.currentAccount;

    if ($scope.paymentData.assetType > 0) {
      // check asset details
      if (!$scope.paymentData.assetCode || !$scope.paymentData.assetIssuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Asset details required'];
        window.scrollTo(0, 0);
        return null;
      }
    }

    Account.emailTx($scope.paymentData)
      .then(function(data) {

        console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.paymentData.destAcct = "";
        $scope.paymentData.memoText = "";
        $scope.paymentData.amount = "";
        $scope.paymentData.password = "";
        window.scrollTo(0, 0);
      })
      .catch(function(data) {
        console.log("error",data);
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        // $scope.paymentData = {};
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