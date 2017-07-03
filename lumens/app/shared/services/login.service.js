// Login Service

var login = angular.module('loginService', []);
// var baseUrl = 'https://saza.com.ng:8888/';
var baseUrl = 'http://localhost:8888/';
login.factory('Login', function($http) {

    return {

        // login a user (pass in user data)
        login : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'login',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                data: $.param(userData)
            });
        },

        tfaLogin : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'tfalogin',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                              'Authorization': 'JWT '+userData.token},
                data: $.param(userData)
            });
        },

        socialLogin : function(type) {
            return $http.get(baseUrl+'auth/'+type);
        },

        logout : function(id) {
            return $http.get(baseUrl+'logout'+id);
        },


        // Register a user (pass in user data)
        register : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'register',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                data: $.param(userData)
            });
        },

        // request password reset link
        requestLink : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'requestlink',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                data: $.param(userData)
            });
        },

        // reset password 
        resetPassword : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'resetpassword',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                data: $.param(userData)
            });
        },

        // activate account 
        activateUser : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'activateuser',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                data: $.param(userData)
            });
        },        

    };

});
