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
        emailTx : function(paymentData) {

            return $http({
                method: 'POST',
                url: baseUrl+'emailtx',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+paymentData.token },
                data: $.param(paymentData)
            });
        },
        getClaims : function(token,account_id,id) {

             return $http({
                method: 'GET',
                url: baseUrl+'getclaims/?token='+token+'&account_id='+account_id+'&id='+id,
                headers: { 'Authorization': 'JWT '+token },

            });
        },
        claimLumens : function(paymentData) {

            return $http({
                method: 'POST',
                url: baseUrl+'claimemailtx',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
                data: $.param(paymentData)
            });
        },
        userClaimLumens : function(paymentData) {

            return $http({
                method: 'POST',
                url: baseUrl+'userclaimlumens',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+paymentData.token },
                data: $.param(paymentData)
            });
        },
        revokeLumens : function(paymentData) {

            return $http({
                method: 'POST',
                url: baseUrl+'reclaimemailtx',
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
        getOffers : function(token,account_id) {

             return $http({
                method: 'GET',
                url: baseUrl+'getoffers/?token='+token+'&account_id='+account_id,
                headers: { 'Authorization': 'JWT '+token },

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

        setOptions : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'setoptions',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token },
                data: $.param(userData)
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

        // save passphrase
        savePassphrase : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'savepassphrase',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },

        // delete account
        deleteAccount : function(deleteData) {

            return $http({
                method: 'POST',
                url: baseUrl+'deleteaccount',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+deleteData.token  },
                data: $.param(deleteData)
            });
        },


        getSeed : function(token,account_id) {
             return $http({
                method: 'GET',
                url: baseUrl+'getseed/?token='+token+'&account_id='+account_id,
                headers: { 'Authorization': 'JWT '+token },

            });
        },

        getContacts : function(token,id) {

             return $http({
                method: 'GET',
                url: baseUrl+'getcontacts/?token='+token+'&id='+id,
                headers: { 'Authorization': 'JWT '+token },

            });
        },
        addContact : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'addcontact',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },
        editContact : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'editcontact',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },
        deleteContact : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'deletecontact',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
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
