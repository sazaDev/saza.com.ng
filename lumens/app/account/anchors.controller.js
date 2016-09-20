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
    
    $scope.anchorData.token = $rootScope.currentUser.token;

    Account.addAnchor($scope.anchorData)
    .success(function(data) {
  
      // console.log(data);
      
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;

      // angular.element('.mb-control-success').triggerHandler('click');
                

    })
    .error(function(data) {
      // console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = data.content.message;
      // angular.element('.mb-control-error').triggerHandler('click');
    });
  };


});