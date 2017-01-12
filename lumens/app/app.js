
var app = angular.module('lumensWall', 
                        [ 
                          'ui.router',
                          'datatables',
                          'angular-loading-bar',
                          'ngclipboard',
                          'angularRandomString',
                          
                          'ngPassword',
                          'loginService',
                          'accountService',
                          'contactService',
                          'userService'

                        ]);

// config loading bar
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.latencyThreshold = 100;
  }]);


// config routes

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $provide) {

  function redirectWhenLoggedOut($q, $injector) {

    return {

        responseError: function(rejection) {

            // console.log("rejection", rejection);
            // Need to use $injector.get to bring in $state or else we get
            // a circular dependency error
            var $state = $injector.get('$state');
          
            if (rejection.status === 401 || rejection.status === 403) {
              localStorage.removeItem('user');
              $state.go('login', {message: "Login Expired. Please sign in"});
            }

            return $q.reject(rejection);
        }
    };
  }

  // Setup for the $httpInterceptor
  $provide.factory('redirectWhenLoggedOut', redirectWhenLoggedOut);

  // Push the new factory onto the $http interceptor array
  $httpProvider.interceptors.push('redirectWhenLoggedOut');


	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('register', {
			url: '/',
      views:{
          // 'sideBar' : {
          //   templateUrl: 'app/shared/menu/sidemenu.controller.html',
          //   controller: 'sideBarController'
          // },
        'pgContainer' : {
          templateUrl: 'app/register/register.controller.html',
      	  controller: 'registerController'
      	},
      			
      },
      data: {
        requireLogin: false
      }
		})
    .state('activate',{
      url: '/activate/:email/:activation_key',
      views: {
        'pgContainer': {
          templateUrl: 'app/login/activate.controller.html',
          controller: 'activateController'
        }
      },
      data:{
        requireLogin: false
      }
    })    
    .state('login',{
      url: '/login',
      views: {
        'pgContainer': {
          templateUrl: 'app/login/login.controller.html',
          controller: 'loginController'
        }
      },
      data:{
        requireLogin: false
      }
    })
    .state('resetpassword',{
      url: '/reset-password/?:token',
      views: {
        'pgContainer': {
          templateUrl: 'app/login/password.controller.html',
          controller: 'passwordController'
        }
      },
      data:{
        requireLogin: false
      }
    })    
    .state('dashboard',{
      url: '/dashboard',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/dashboard/dashboard.controller.html',
          controller: 'dashboardController'
        },
        'txHistory@dashboard' :{
          templateUrl: 'app/account/transactions.controller.html',
          controller: 'transactionsController'
        },
        'contactForm@dashboard' :{
          templateUrl: 'app/contact/contact.controller.html',
          controller: 'contactController'
        }
      },
      data:{
        requireLogin: true
      }
    })
    .state('setupaccount',{
      url: '/setup-account',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/create_account.controller.html',
          controller: 'createAccountController'
        }
      },
      data:{
        requireLogin: true
      }
    })
    .state('sendpayment',{
      url: '/send_payment',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/send_payment.controller.html',
          controller: 'sendPaymentController'
        }
      },
      data:{
        requireLogin: true
      }
    })
    .state('recvpayment',{
      url: '/recv-payment',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/recv_payment.controller.html',
          
        }
      },
      data:{
        requireLogin: true
      }
    })    
    .state('transactions',{
      url: '/transactions',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/transactions.controller.html',
          controller: 'transactionsController'
        }
      },
      data:{
        requireLogin: true
      }
    })
    .state('anchors',{
      url: '/anchors',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/anchors.controller.html',
          controller: 'anchorsController'
        }
      },
      data:{
        requireLogin: true
      }
    })    
    .state('addaccount',{
      url: '/add-account',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/create_account.controller.html',
          controller: 'createAccountController'
        }
      },
      data:{
        requireLogin: true
      }
    })    
    .state('setusername',{
      url: '/set-username',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/set_username.controller.html',
          controller: 'setUsernameController'
        }
      },
      data:{
        requireLogin: true
      }
    })
    .state('setinflation',{
      url: '/set-inflation',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/set_inflation.controller.html',
          controller: 'setInflationController'
        }
      },
      data:{
        requireLogin: true
      }
    })    
    .state('mergeaccount',{
      url: '/merge-account',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/account/merge_account.controller.html',
          controller: 'setUsernameController'
        }
      },
      data:{
        requireLogin: true
      }
    })    
    .state('settings',{
      url: '/settings',
      views: {
        'sideBar' : {
          templateUrl: 'app/shared/menu/sidemenu.controller.html',
          controller: 'sideBarController'
        },
        'pgContent': {
          templateUrl: 'app/settings/settings.controller.html',
          controller: 'settingsController'
        }
      },
      data:{
        requireLogin: true
      }
    });

  $locationProvider.html5Mode(true);
  

});

app.run(function ($rootScope, $state, User ) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

  $rootScope.currentUser = JSON.parse(localStorage.getItem('user'));
  User.set($rootScope.currentUser);
  // $rootScope.currentUser = User.get();
  $rootScope.ngnRate = 400;
  $rootScope.siteURL = 'saza.com.ng';
  var requireLogin = toState.data.requireLogin;
  // console.log("currentUser: ", $rootScope.currentUser);
  // console.log("requireLogin: ", requireLogin);
    
    // if user is not logged in and page requires login
    if (requireLogin && !angular.isObject($rootScope.currentUser)) {
        event.preventDefault();
        $state.go('login');
    }
    
    if (requireLogin && angular.isObject($rootScope.currentUser)) {
      // console.log("page req login");
        // event.preventDefault();
        // $state.go('setupaccount');

        // if ($rootScope.currentUser.enabled == 0) {
        //   event.preventDefault();
        //       $state.go('activate');
        // }
        // if ($rootScope.currentUser.account_id === "") {
        //   event.preventDefault();
        //       $state.go('setupAccount');
        // }
    
    }

    if (toState.name === "login" || toState.name === "register" ) {
        
        if ($rootScope.currentUser) {
          if ($rootScope.currentUser.authenticated) {
            event.preventDefault();
            $state.go('dashboard');
          }
            
        }
    }else{
        //console.log("NOT checking states, auth or register");
    }

  });



});