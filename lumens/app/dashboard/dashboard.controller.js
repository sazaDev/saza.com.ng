var lumensWall = angular.module('lumensWall');

lumensWall.controller('dashboardController', function($scope, $state, $http, $rootScope, Account, User) {
			// $rootScope.currentUser = User.get();
      console.log(User.get());
      if ($rootScope.currentUser.accounts.length < 1) {
          event.preventDefault();
              $state.go('setupaccount');
   }
   $scope.balance = {};
   $scope.rates = {};
   $scope.assets = [];
	$scope.init = function () {
    console.log("inside dashb", $rootScope.currentUser.currentAccount);
    console.log("inside dashb2", User.getCurrentAccount());

		// get stellar account balance
		// load xlm to btc rate
		// load xlm to usd rate
		// load usd to ngn rate
		// convert xlm balance to btc
		// convert xlm balance to usd
		// convert xlm balance to ngn
    $scope.rates.ngn = $rootScope.ngnRate;
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
				
        balances.forEach(function(balance) {
          console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
          if (balance.asset_type === 'native') {
						$scope.balance.xlm = balance.balance;
          }
        });
        // console.log("success",data);

        Account.getUSD()
          .success(function(data) {
            // console.log("success",data);
            $scope.rates.usd = data.ticker.price;
            
              $scope.balance.usd = $scope.balance.xlm * $scope.rates.usd;
              $scope.balance.ngn = $scope.balance.xlm*$scope.rates.usd*$scope.rates.ngn;
            // console.log("xlm bal", $scope.balance.xlm);
            // console.log("usd rates", $scope.rates.usd);
            // console.log("usd balance", $scope.balance.usd);
          })
          .error(function(data) {
            // console.log("error",data);
           
          });
        Account.getBTC()
          .success(function(data) {
            // console.log("success",data);
            $scope.rates.btc = data.ticker.price;
            $scope.balance.btc = $scope.balance.xlm*$scope.rates.btc;
          })
          .error(function(data) {
            // console.log("error",data);
           
          });          
       
      })
      .error(function(data) {
        // console.log("error",data);
       
      });

    
		


    
      
      
	};

});