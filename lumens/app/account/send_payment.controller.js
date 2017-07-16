var lumensWall = angular.module('lumensWall');

lumensWall.controller('sendPaymentController', function($scope, $state, $http, $rootScope, Account) {

  $scope.paymentData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;
  $scope.contacts = [];

  $scope.init = function() {
    $scope.paymentData.id = $rootScope.currentUser.id;
    $scope.paymentData.email = $rootScope.currentUser.email;
    $scope.paymentData.token = $rootScope.currentUser.token;
    $scope.paymentData.assetType = 0;
    $scope.getContacts();
  };

  $scope.getContacts = function() {

    Account.getContacts($rootScope.currentUser.token, $rootScope.currentUser.id)
    .success(function(data) {

      $scope.contacts = data.content.data;
    })
    .error(function(data) {
       console.log("Error", data);


    });
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

    Account.sendPayment($scope.paymentData)
      .then(function(resp) {

        console.log("success",resp);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = resp.data.content.message;
        $scope.paymentData = {};
        window.scrollTo(0, 0);
      })
      .catch(function(resp) {

        console.log("error",resp);
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        if (resp.content) {
        $scope.statusMsg.content = resp.content.message;
        $scope.$apply();
        } else{
          $scope.statusMsg.content = resp.data.content.message;
        }

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

  $scope.contactChange = function(id) {
    console.log(id);
    $scope.paymentData.destAcct = id;
    console.log($scope.paymentData.destAcct);
  };



});