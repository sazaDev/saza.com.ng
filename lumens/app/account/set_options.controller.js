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
      if (!$scope.userData.signerKey || (typeof($scope.userData.signerWeight) === 'undefined') || $scope.userData.signerWeight === null ) {
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = ['Signer key and weight pair required'];
        window.scrollTo(0, 0);
        return null;
      }
    }

    Account.setOptions($scope.userData)
      .then(function(resp) {

        console.log("success",resp);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = resp.data.content.message;
        $scope.userData = {};
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

  $scope.showDesc = function(id) {
    $scope.signerDesc = $scope.signerDefs[id];
  };

});