var lumensWall = angular.module('lumensWall');

lumensWall.controller('pathPaymentController', function($scope, $state, $http, $rootScope, Account) {

  $scope.paymentData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;


  $scope.init = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    $scope.paymentData.sendAssetType = 0;
    $scope.paymentData.destAssetType = 0;

  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.pathPayment = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    $scope.paymentData.account_id = $rootScope.currentUser.currentAccount;

    if ($scope.paymentData.sendAssetType > 0) {
      // check asset details
      if (!$scope.paymentData.sendAssetCode || !$scope.paymentData.sendAssetIssuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Sending asset details required'];
        window.scrollTo(0, 0);
        return null;
      }
    }


    if ($scope.paymentData.destAssetType > 0) {
      // check asset details
      if (!$scope.paymentData.destAssetCode || !$scope.paymentData.destAssetIssuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Destination asset details required'];
        window.scrollTo(0, 0);
        return null;
      }
    }

    Account.pathPayment($scope.paymentData)
      .then(function(data) {

        // console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.paymentData = {};
        window.scrollTo(0, 0);
      })
      .catch(function(data) {

        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.paymentData = {};
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