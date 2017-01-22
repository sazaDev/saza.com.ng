var lumensWall = angular.module('lumensWall');

lumensWall.controller('settingsController', function($scope, $state, $http, $rootScope, Account) {

	$scope.passwordData = {};
	$scope.statusMsg = false;
	$scope.seed = 'XXXXXXXXXXXXXXXXXXXXXXXXXXX';
	$scope.tempSeed = "";
	$scope.showSeed = false;
	$scope.init = function() {
		// load the seed here but dont display yet
    Account.getSeed($rootScope.currentUser.token, $rootScope.currentUser.currentAccount)
      .success(function(data) {
        // console.log("success",data);
        $scope.tempSeed = data.content.message;
      })
      .error(function(data) {
        // console.log("error",data);
      });

	};

	$scope.changePassword = function() {
		// body...
	
		
    $scope.passwordData.token = $rootScope.currentUser.token;

    Account.changePassword($scope.passwordData)
      .success(function(data) {

        // console.log("success",data);
       // clear form
       // show success message
       $scope.statusMsg = {};
       $scope.statusMsg.type = 'alert-success';
       $scope.statusMsg.content = data.content.message;
       $scope.passwordData = {};
        
        // angular.element('.mb-control-success').triggerHandler('click');
                

      })
      .error(function(data) {
        // console.log("error",data);
        $scope.statusMsg = {};
       $scope.statusMsg.type = 'alert-danger';
       $scope.statusMsg.content = data.content.message;
       $scope.passwordData = {};
				// Display Error
        // angular.element('.mb-control-error').triggerHandler('click');
      });

	};

	$scope.toggleSeedView = function() {

		if (!$scope.showSeed) {
			$scope.seed = $scope.tempSeed;
			$scope.showSeed = true;
		}else{
			$scope.seed = 'XXXXXXXXXXXXXXXXXXXXXXXXXXX';
			$scope.showSeed = false;
		}
		
	};

});