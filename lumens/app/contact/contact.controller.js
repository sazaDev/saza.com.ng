var lumensWall = angular.module('lumensWall');

lumensWall.controller('contactController', function($scope, $state, $http, randomString, $rootScope, Contact) {
		
	$scope.contactData = {};
	$scope.statusMsg = {};
	$scope.responseData = {};


	$scope.init = function() {
		// console.log("loading  contact controller");
		$scope.contactData.email = $rootScope.currentUser.email || "";
	};

  $scope.closeAlert = function() {
    $scope.statusMsg = {};
  };
  
	$scope.sendMessage = function () {
		$scope.contactData.token = $rootScope.currentUser.token;
		// console.log($scope.contactData);
		Contact.sendMessage($scope.contactData)
			.success(function(data) {

				// console.log(data);

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = data.content.message;
      $scope.contactData = {};

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