var lumensWall = angular.module('lumensWall');

lumensWall.controller('allowTrustController', function($scope, $state, $http, $rootScope, Account, User) {

  $scope.trustData = {};
  $scope.statusMsg = false;



  $scope.init = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    $scope.trustData.authorize = true;
  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };

  $scope.allowTrust = function() {
    $scope.trustData.id = $rootScope.currentUser.id;
    $scope.trustData.email = $rootScope.currentUser.email;
    $scope.trustData.token = $rootScope.currentUser.token;
    $scope.trustData.account_id = $rootScope.currentUser.currentAccount;


    Account.allowTrust($scope.trustData)
      .then(function(resp) {

        console.log("success",data);
        // show success message
        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = resp.data.content.message;
        $scope.trustData = {};
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





});