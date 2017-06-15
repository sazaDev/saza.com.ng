var lumensWall = angular.module('lumensWall');

lumensWall.controller('setOptionsController', function($scope, $state, $http, $rootScope, Account, User) {

  $scope.userData = {};
  $scope.statusMsg = false;
  $scope.signerDefs = ['The ed25519 public key of the signer.',
                        'sha256 hash (Buffer or hex string) of preimage that will unlock funds. Preimage should be used as signature of future transaction.',
                        'Hash (Buffer or hex string) of transaction that will unlock funds.'
                        ];
  $scope.signerDesc = "";


  $scope.init = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;


  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.setOptions = function() {
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.email = $rootScope.currentUser.email;
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.account_id = $rootScope.currentUser.currentAccount;

    if ($scope.userData.signerKey || $scope.userData.signerWeight || $scope.userData.signerType) {
      // check asset details
      if (!$scope.userData.signerKey || !$scope.userData.signerWeight) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Signer key and weight pair required'];
        window.scrollTo(0, 0);
        return null;
      }
    }

    Account.setOptions($scope.userData)
      .success(function(data) {

        console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.userData = {};
        window.scrollTo(0, 0);

      })
      .error(function(data) {

        console.log("error",data);
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.userData = {};
        window.scrollTo(0, 0);


      });
  };

  $scope.showDesc = function(id) {
    $scope.signerDesc = $scope.signerDefs[id];
  };

});