var lumensWall = angular.module('lumensWall');

lumensWall.controller('anchorsController', function($scope, $state, $http, $rootScope, Account) {

  $scope.anchorData = {};
  $scope.statusMsg = {};
  $scope.init = function() {

  };

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };



  $scope.addAnchor = function() {
    $scope.anchorData.id = $rootScope.currentUser.id;
    $scope.anchorData.email = $rootScope.currentUser.email;
    $scope.anchorData.token = $rootScope.currentUser.token;
    $scope.anchorData.account_id = $rootScope.currentUser.currentAccount;

    Account.addAnchor($scope.anchorData)
    .then(function(resp) {

      console.log(resp);

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert alert-success';
      $scope.statusMsg.content = resp.data.content.message;




    })
    .catch(function(resp) {
      console.log(resp);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert alert-danger';
      if (resp.content) {
          $scope.statusMsg.content = resp.content.message;
          $scope.$apply();
        } else{
          $scope.statusMsg.content = resp.data.content.message;
        }

    });
  };


});