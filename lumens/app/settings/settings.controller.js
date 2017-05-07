var lumensWall = angular.module('lumensWall');

lumensWall.controller('settingsController', function($scope, $state, $http, $rootScope, Account) {

	$scope.passwordData = {};
  $scope.deleteData = {};
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

  $scope.deleteAccount = function() {
    // body...
  
    $scope.deleteData.id = $rootScope.currentUser.id;
    $scope.deleteData.email = $rootScope.currentUser.email;
    $scope.deleteData.token = $rootScope.currentUser.token;
    $scope.deleteData.account_id = $rootScope.currentUser.currentAccount;

    Account.deleteAccount($scope.deleteData)
      .success(function(data) {

        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-success';
        $scope.statusMsg.content = data.content.message;
        $scope.deleteData = {};

        var temp_id = -1;

        $rootScope.currentUser.accounts.forEach(function(a, index) {
          if(a.account_id === $rootScope.currentUser.currentAccount){
            temp_id = index;
            console.log(temp_id);
          }
        });
        $rootScope.currentUser.accounts.splice(temp_id,1);

        if ($rootScope.currentUser.accounts.length > 0) {
          console.log($rootScope.currentUser);
          $rootScope.currentUser.currentAccount = $rootScope.currentUser.accounts[0].account_id;
          $rootScope.currentUser.currentUsername = $rootScope.currentUser.accounts[0].fed_name;
        } else{
          console.log($rootScope.currentUser);
          $rootScope.currentUser.currentAccount = "";
          $rootScope.currentUser.currentUsername = "";
        }
        
        

        localStorage.setItem('user', JSON.stringify($rootScope.currentUser));

        console.log($rootScope.currentUser);
        window.scrollTo(0, 0); 
        $state.go('dashboard', {}, {reload: true});

      })
      .error(function(data) {
        // console.log("error",data);
        $scope.statusMsg = {};
       $scope.statusMsg.type = 'alert-danger';
       $scope.statusMsg.content = data.content.message;
       $scope.deleteData = {};
       window.scrollTo(0, 0);
        
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