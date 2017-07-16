var lumensWall = angular.module('lumensWall');

lumensWall.controller('passiveOfferController', function($scope, $state, $http, $rootScope, Account) {

  $scope.offerData = {};
  $scope.statusMsg = false;
  $scope.userRegex = /^()[a-z0-9][^<,|>]+$/i;


  $scope.init = function() {
    $scope.offerData.id = $rootScope.currentUser.id;
    $scope.offerData.email = $rootScope.currentUser.email;
    $scope.offerData.token = $rootScope.currentUser.token;
    $scope.offerData.sellingAssetType = 0;
    $scope.offerData.buyingAssetType = 0;
    $scope.assets = $rootScope.currentUser.balances;
    $scope.getOffers();

  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.passiveOffer = function() {
    $scope.offerData.id = $rootScope.currentUser.id;
    $scope.offerData.email = $rootScope.currentUser.email;
    $scope.offerData.token = $rootScope.currentUser.token;
    $scope.offerData.account_id = $rootScope.currentUser.currentAccount;

    if ($scope.offerData.sellingAssetType > 0) {
      // check asset details
      if (!$scope.offerData.sellingAssetCode || !$scope.offerData.sellingAssetIssuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Selling asset details required'];
        window.scrollTo(0, 0);
        return null;
      }
    }


    if ($scope.offerData.buyingAssetType > 0) {
      // check asset details
      if (!$scope.offerData.buyingAssetCode || !$scope.offerData.buyingAssetIssuer) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Buying asset details required'];
        window.scrollTo(0, 0);
        return null;
      }
    }


    Account.passiveOffer($scope.offerData)
      .then(function(resp) {

        console.log("success",resp);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = resp.data.content.message;
        $scope.offerData = {};
        window.scrollTo(0, 0);
        $scope.getOffers();
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


  $scope.isCustomAsset = function(type) {
    if (type == 4 || type == 12) {
      return true;
    } else{
      return false;
    }
  };


  $scope.clearAsset = function(type) {
    if (type == 1) {
      $scope.offerData.sellingAssetIssuer = "";
      $scope.offerData.sellingAssetCode = "";
    }

    if (type == 2) {
      $scope.offerData.buyingAssetIssuer = "";
      $scope.offerData.buyingAssetCode = "";
    }

  };


  $scope.getOffers = function() {
    Account.getOffers($rootScope.currentUser.token, $rootScope.currentUser.currentAccount)
      .success(function(data) {
        console.log(data.content.data);

        $scope.offers = data.content.data;

      })
      .error(function(data) {
        console.log("error",data);

      });
  };

});