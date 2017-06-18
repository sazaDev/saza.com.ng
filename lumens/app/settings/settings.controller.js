var lumensWall = angular.module('lumensWall');
var QRCode = qrcodelib;

lumensWall.controller('settingsController', function($scope, $state, $http, $rootScope, Account, User) {

	$scope.passwordData = {};
  $scope.userData = {};
  $scope.tfaData = {};
  $scope.deleteData = {};
	$scope.statusMsg = null;
	$scope.seed = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
	$scope.tempSeed = "";
	$scope.showSeed = false;
  $scope.show_qr = false;
  $scope.otpUrl = "../img/logo.png";
  $scope.otpSecretKey = "";
  $scope.otp_id = "";
	$scope.init = function() {
		// load the seed here but dont display yet
    // Account.getSeed($rootScope.currentUser.token, $rootScope.currentUser.currentAccount)
    //   .success(function(data) {
    //     $scope.tempSeed = data.content.message;
    //   })
    //   .error(function(data) {

    //   });

	};

	$scope.changePassword = function() {

    $scope.passwordData.token = $rootScope.currentUser.token;

    Account.changePassword($scope.passwordData)
      .success(function(data) {

       // clear form
       // show success message
       $scope.statusMsg = {};
       $scope.statusMsg.type = 'alert-success';
       $scope.statusMsg.content = data.content.message;
       $scope.passwordData = {};

      })
      .error(function(data) {

        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.passwordData = {};

      });

	};

  $scope.changePassphrase = function() {

    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.id = $rootScope.currentUser.id;
    Account.changePassphrase($scope.userData)
    .then(function(resp) {
      console.log(resp);
      resp.data.content.data.authenticated = true;

      // set the currently active account
      if (resp.data.content.data.accounts.length > 0) {
        resp.data.content.data.currentAccount = resp.data.content.data.accounts[0].account_id;
        resp.data.content.data.currentUsername = resp.data.content.data.accounts[0].fed_name;
      }

      var user = resp.data.content.data;

      User.set(user);

      // Set the stringified user data into local storage
      localStorage.setItem('user', JSON.stringify(user));
      console.log("currentUser", User.get());
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-success';
      $scope.statusMsg.content = resp.data.content.message;

    })
    .catch(function(data) {
      console.log(data);
      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      if (data.content) {
        $scope.statusMsg.content = data.content.message;
      } else{
        $scope.statusMsg.content = data.data.content.message;
      }
      $scope.$apply();


    });
  };

  $scope.deleteAccount = function() {

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
        // remove from local accounts array
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

        $scope.statusMsg = {};
        $scope.statusMsg.type = 'alert-danger';
        $scope.statusMsg.content = data.content.message;
        $scope.deleteData = {};
        window.scrollTo(0, 0);

      });

  };

	$scope.toggleSeedView = function() {

    $scope.userData.account_id = $rootScope.currentUser.currentAccount;

    Account.getSeed($scope.userData)
      .then(function(data) {
        console.log(data);
        $scope.tempSeed = data.content.message[0];
        $scope.seed = $scope.tempSeed;
        $scope.$apply();

      })
      .catch(function(data) {
        console.log(data);
      });


		// if (!$scope.showSeed) {
    //     

      


		// 	$scope.seed = $scope.tempSeed;
		// 	$scope.showSeed = true;
		// }else{
		// 	$scope.seed = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
		// 	$scope.showSeed = false;
		// }

	};

  $scope.get2faSecret = function() {
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.id = $rootScope.currentUser.id;

    Account.get2faSecret($scope.userData)
    .then(function(resp) {
      console.log(resp);
      $scope.show_qr = true;
      var respContent = resp.data.content;
      $scope.otpSecretKey = respContent.data.auth_code;
      $scope.otp_id = respContent.data.otp_id;
      QRCode.toDataURL(respContent.data.image_url, function (err, url) {
        console.log(err);
        console.log(url);
        $scope.otpUrl = url;

      });

    })
    .catch(function(data) {
      console.log(data);


    });


  };

  $scope.enable2fa = function(secret) {
    $scope.userData.token = $rootScope.currentUser.token;
    $scope.userData.id = $rootScope.currentUser.id;
    $scope.userData.otpSecretKey = secret;
    $scope.userData.otp_id = $scope.otp_id;
    window.scrollTo(0, 0);
    if ($scope.userData.otpToken) {
      Account.enable2fa($scope.userData)
        .then(function(resp) {
          console.log(resp);
          var respContent = resp.data.content;
          respContent.data.authenticated = true;
          // set the currently active account
          if (respContent.data.accounts.length > 0) {
            respContent.data.currentAccount = respContent.data.accounts[0].account_id;
            respContent.data.currentUsername = respContent.data.accounts[0].fed_name;
          }

          var user = respContent.data;

          User.set(user);

          // Set the stringified user data into local storage
          localStorage.setItem('user', JSON.stringify(user));
          console.log("currentUser", User.get());
          $scope.statusMsg = {};
          $scope.statusMsg.type = 'alert-success';
          $scope.statusMsg.content = respContent.message;
          // $scope.show_qr = false;

        })
        .catch(function(data) {
          console.log(data);
          $scope.statusMsg = {};
          $scope.statusMsg.type = 'alert-danger';
          if (data.content) {
            $scope.statusMsg.content = data.content.message;
          } else{
            $scope.statusMsg.content = data.data.content.message;
          }


        });


    } else{

      $scope.statusMsg = {};
      $scope.statusMsg.type = 'alert-danger';
      $scope.statusMsg.content = ['Invalid Code'];
      // $scope.$apply();

    }

  };


  $scope.disable2fa = function() {
    $scope.tfaData.token = $rootScope.currentUser.token;
    $scope.tfaData.id = $rootScope.currentUser.id;

    
    window.scrollTo(0, 0);

      Account.disable2fa($scope.tfaData)
        .then(function(resp) {
          console.log(resp);
          var respContent = resp.data.content;
          respContent.data.authenticated = true;
          // set the currently active account
          if (respContent.data.accounts.length > 0) {
            respContent.data.currentAccount = respContent.data.accounts[0].account_id;
            respContent.data.currentUsername = respContent.data.accounts[0].fed_name;
          }

          var user = respContent.data;

          User.set(user);

          // Set the stringified user data into local storage
          localStorage.setItem('user', JSON.stringify(user));
          console.log("currentUser", User.get());
          $scope.statusMsg = {};
          $scope.statusMsg.type = 'alert-success';
          $scope.statusMsg.content = respContent.message;
          // $scope.show_qr = false;
          $state.go('settings', {}, {reload: true});

        })
        .catch(function(data) {
          console.log(data);
          $scope.statusMsg = {};
          $scope.statusMsg.type = 'alert-danger';
          if (data.content) {
            $scope.statusMsg.content = data.content.message;
          } else{
            $scope.statusMsg.content = data.data.content.message;
          }


        });

  };


});