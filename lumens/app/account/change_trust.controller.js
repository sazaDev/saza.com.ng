var lumensWall = angular.module('lumensWall');

lumensWall.controller('changeTrustController', function($scope, $state, $http, $rootScope, Account, User) {
  
  $scope.trustData = {};
  $scope.statusMsg = false;
  $scope.assets = [];
  

  $scope.init = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    console.log("currentUser", $rootScope.currentUser);

    $scope.assets = $rootScope.currentUser.balances;

    Account.getAccount($rootScope.currentUser.token, $rootScope.currentUser.currentAccount)
      .success(function(data) {
        console.log(data.content.data);
        var balances = data.content.data.balances;
        $scope.assets = balances;

        $rootScope.currentUser.balances = [];
        $rootScope.currentUser.balances = balances;

        var localUser = JSON.stringify($rootScope.currentUser);
        // Set the stringified user data into local storage
      
        localStorage.setItem('user', localUser);
        
        console.log("currentUser", $rootScope.currentUser);

      })
      .error(function(data) {
        // console.log("error",data);
       
      });
    
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
        window.scrollTo(0, 0);
        // 
        Account.getAccount($rootScope.currentUser.token, $rootScope.currentUser.currentAccount)
          .success(function(data) {
            console.log(data.content.data);
            var balances = data.content.data.balances;
            $scope.assets = balances;

            $rootScope.currentUser.balances = [];
            $rootScope.currentUser.balances = balances;

            var localUser = JSON.stringify($rootScope.currentUser);
            // Set the stringified user data into local storage
          
            localStorage.setItem('user', localUser);
            
            console.log("currentUser", $rootScope.currentUser);

          })
          .error(function(data) {
            // console.log("error",data);
           
          });

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

  $scope.clearAsset = function() {
    $scope.trustData.assetCode = "";
    $scope.trustData.assetIssuer = "";
  };



});