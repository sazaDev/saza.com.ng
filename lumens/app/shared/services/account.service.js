    // Login Service

var login = angular.module('accountService', []);
// var baseUrl = 'https://saza.com.ng:8888/';
var baseUrl = 'http://localhost:8888/';
login.factory('Account', function($http) {

    return {

        
        create : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'createaccount',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token},
                data: $.param(userData)
            });
        },
        
        link : function(userData) {
            //console.log(userData);
            return $http({
                method: 'POST',
                url: baseUrl+'linkaccount',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token },
                // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                data: $.param(userData)
            });
        },

        sendPayment : function(paymentData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'sendpayment',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+paymentData.token },
                data: $.param(paymentData)
            });
        },
        pathPayment : function(paymentData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'pathpayment',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+paymentData.token },
                data: $.param(paymentData)
            });
        },

        changeTrust : function(trustData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'changetrust',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+trustData.token },
                data: $.param(trustData)
            });
        },

        allowTrust : function(trustData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'allowtrust',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+trustData.token },
                data: $.param(trustData)
            });
        },       

        manageData : function(manageData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'managedata',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+manageData.token },
                data: $.param(manageData)
            });
        },

        manageOffer : function(offerData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'manageoffer',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+offerData.token },
                data: $.param(offerData)
            });
        },

        passiveOffer : function(offerData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'passiveoffer',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+offerData.token },
                data: $.param(offerData)
            });
        },

        setUsername : function(userData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'setusername',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token },
                data: $.param(userData)
            });
        },

        setInflation : function(userData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'setinflation',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token },
                data: $.param(userData)
            });
        },
        
        mergeAccount : function(userData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'mergeaccount',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token },
                data: $.param(userData)
            });
        },
        getTransactions : function(token,account_id) {
            
             return $http({
                method: 'GET',
                url: baseUrl+'gettransactions/?token='+token+'&account_id='+account_id,
                headers: { 'Authorization': 'JWT '+token },
                
            });
        },

        getAccount : function(token,account_id) {
            return $http({
                method: 'GET',
                url: baseUrl+'getaccount/?token='+token+'&account_id='+account_id,
                headers: { 'Authorization': 'JWT '+token },
                
            });
        },

        addAnchor : function(anchorData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'addanchor',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+anchorData.token  },
                data: $.param(anchorData)
            });
        },

        // change password
        changePassword : function(passwordData) {
            
            return $http({
                method: 'POST',
                url: baseUrl+'changepassword',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+passwordData.token  },
                data: $.param(passwordData)
            });
        },
       
        getSeed : function(token) {
             return $http({
                method: 'GET',
                url: baseUrl+'getseed/?token='+token,
                headers: { 'Authorization': 'JWT '+token },
                
            });
        },

        getUSD : function(token) {
             return $http({
                method: 'GET',
                url: 'https://www.cryptonator.com/api/ticker/xlm-usd',
                
                
            });
        },    
        getBTC : function(token) {
             return $http({
                method: 'GET',
                url: 'https://www.cryptonator.com/api/ticker/xlm-btc',
                
            });
        },            

    };

});
