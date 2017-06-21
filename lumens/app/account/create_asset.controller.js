var lumensWall = angular.module('lumensWall');

lumensWall.controller('createAssetController', function($scope, $state, $http, $rootScope, Account) {

  $scope.assetData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;
  $scope.contacts = [];

  $scope.init = function() {
    $scope.assetData.id = $rootScope.currentUser.id;
    $scope.assetData.email = $rootScope.currentUser.email;
    $scope.assetData.token = $rootScope.currentUser.token;
    $scope.assetData.assetType = 0;
    // $scope.getContacts();
  };

  // $scope.getContacts = function() {

  //   Account.getContacts($rootScope.currentUser.token, $rootScope.currentUser.id)
  //   .success(function(data) {

  //     $scope.contacts = data.content.data;
  //   })
  //   .error(function(data) {
  //      console.log("Error", data);


  //   });
  // };


  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.createAsset = function() {
    $scope.assetData.id = $rootScope.currentUser.id;
    $scope.assetData.email = $rootScope.currentUser.email;
    $scope.assetData.token = $rootScope.currentUser.token;
    $scope.assetData.account_id = $rootScope.currentUser.currentAccount;

    if ($scope.assetData.assetType > 0) {
      // check asset details
      if (!$scope.assetData.assetCode || !$scope.assetData.issuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Asset details required'];
        window.scrollTo(0, 0);
        return null;
      }
    }

    Account.createAsset($scope.assetData)
      .then(function(data) {

        console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.data.content.message;
        $scope.assetData = {};
        window.scrollTo(0, 0);
      })
      .catch(function(data) {

        console.log("error",data);
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        if (data.content) {
        $scope.statusMsg.content = data.content.message;
          $scope.$apply();
        } else{
          $scope.statusMsg.content = data.data.content.message;
        }

        $scope.assetData = {};
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
    $scope.assetData.destAcct = id;
    console.log($scope.assetData.destAcct);
  };



});