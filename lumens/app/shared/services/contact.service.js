// Contact Service

var contact = angular.module('contactService', []);
// var baseUrl = 'https://saza.com.ng:8888/';
var baseUrl = 'http://localhost:8888/';
contact.factory('Contact', function($http) {

    return {

        // login a user (pass in user data)
        sendMessage : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'sendmessage',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token},
                data: $.param(userData)
            });
        },
       

    };

});
