var lumensWall = angular.module('lumensWall');

lumensWall.controller('reclaimEmailTxController', function($scope, $state, $http, $rootScope, Account, DTOptionsBuilder) {

  $scope.records = [];
  $scope.statusMsg = false;
  $scope.userData = {};

  $scope.init = function() {
    $scope.getClaims();

  };



  $scope.getClaims = function() {

    Account.getClaims($rootScope.currentUser.token, $rootScope.currentUser.currentAccount, $rootScope.currentUser.id)
    .success(function(data) {
      // console.log("data", data);
      $scope.records = data.content.data;
      console.log($scope.records);
    })
    .error(function(data) {
       console.log("Error", data);

    });
  };

  $scope.revokeLumens = function(tx) {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;
    $scope.userData.txObj = tx;

    Account.revokeLumens($scope.userData)
    .then(function(resp) {
      console.log("success",resp);

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = resp.data.content.message;
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

        window.scrollTo(0, 0);

    });

  };


  $scope.getStatus = function (status) {
    if (status === 0) {
      return "Unclaimed";
    }

    if (status == 1) {
      return "Claimed";
    }

    if (status == 2) {
      return "Revoked";
    }
  }





});