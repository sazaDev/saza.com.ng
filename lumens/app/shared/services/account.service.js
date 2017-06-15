// Account Service

var StellarSDK = StellarSdk;
var Utility = Utility;
var Config = Config;
// var forge = require('node-forge');
var account = angular.module('accountService', []);
// var baseUrl = 'https://saza.com.ng:8888/';
var baseUrl = 'http://localhost:8888/';

var server = "";

if ( Config.General.production) {
  StellarSDK.Network.usePublicNetwork();
  server = new StellarSDK.Server(Config.Stellar.liveNetwork);

}

if ( !Config.General.production) {
  StellarSDK.Network.useTestNetwork();
  server = new StellarSDK.Server(Config.Stellar.testNetwork);

}


account.factory('Account', function($http, $rootScope) {

    return {


        create : function(userData) {
            // create stellar account
            var pair = StellarSDK.Keypair.random();
            console.log(userData);

            // save encrypted secret key and account Id in backend
            var isValid = Utility.validatePassphrase(userData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {
              var encryptedObj = Utility.encrypt(userData.tx_passphrase, pair.secret());
              userData.account_id = pair.publicKey();
              userData.encryptedObj = encryptedObj;
              console.log(userData);
              return $http({
                  method: 'POST',
                  url: baseUrl+'createaccount',
                  headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                              'Authorization': 'JWT '+userData.token},
                  data: $.param(userData)
              });
            } else{
              return Utility.returnError(['Invalid passphrase']);
            }

        },

        link : function(userData) {
            console.log(userData);

            // save encrypted secret key and account Id in backend
            var isValid = Utility.validatePassphrase(userData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            var isValidKey = Utility.validateSeed(userData.seed);
            if (isValid && isValidKey) {
              //encrypt seed and send encrypted obj
              var encryptedObj = Utility.encrypt(userData.tx_passphrase, userData.seed);
              userData.account_id = isValidKey.publicKey();
              userData.encryptedObj = encryptedObj;
              console.log(userData);

              return $http({
                  method: 'POST',
                  url: baseUrl+'linkaccount',
                  headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                              'Authorization': 'JWT '+userData.token },
                  // headers: {'X-CSRF-TOKEN': CSRF_TOKEN},
                  data: $.param(userData)
              });
            }else{
              return Utility.returnError(['Invalid passphrase or secret key']);
            }
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
            console.log(trustData);
            var messages = [];
            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(trustData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {
                // create change trust tx
              if (!StellarSDK.StrKey.isValidEd25519PublicKey(trustData.assetIssuer)) {
                return Utility.returnError(['Invalid Asset Issuer']);
              }

              return server.loadAccount(trustData.account_id)
                .then(function(srcAcct) {

                  var asset = new StellarSDK.Asset(trustData.assetCode, trustData.assetIssuer);
                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                      operationObj.asset = asset;

                  if (trustData.limit) {
                    operationObj.limit = trustData.limit.toString();
                  }

                  transaction.addOperation(StellarSDK.Operation.changeTrust(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(trustData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, trustData.tx_passphrase)));
                  return server.submitTransaction(builtTx);

                })
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(xdrResult) {
                  messages.push('Trustline created successfully');
                  return Utility.returnSuccess(messages);
                })
                .catch(function(error) {
                  // for submit tx
                  console.log(error);
                  var errorMessages = Utility.extractError(error);
                  errorMessages.forEach(function(m) {
                    messages.push(m);
                  });

                  throw new Error('TxError');

                })
                .catch(function(error) {
                  // catch all
                  console.log(error);
                  messages.push('Unable to complete change trust operation');
                  return Utility.returnError(messages);
                  // return res.status(400).send({status: false, content: {message: messages}});
                });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }

            // return $http({
            //     method: 'POST',
            //     url: baseUrl+'changetrust',
            //     headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
            //                 'Authorization': 'JWT '+trustData.token },
            //     data: $.param(trustData)
            // });
        },

        allowTrust : function(trustData) {

          console.log(trustData);
            var messages = [];
            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(trustData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {
                // create change trust tx
              if (!StellarSDK.StrKey.isValidEd25519PublicKey(trustData.trustor)) {
                return Utility.returnError(['Invalid Trustor']);
              }
              // check if source account is active
              return server.loadAccount(trustData.account_id)
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.trustor = trustData.trustor;
                  operationObj.assetCode = trustData.assetCode;
                  operationObj.authorize = trustData.authorize;

                  transaction.addOperation(StellarSDK.Operation.changeTrust(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(trustData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, trustData.tx_passphrase)));

                  return server.submitTransaction(builtTx);

                })
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(xdrResult) {
                  messages.push('Allow Trust operation successful');
                  return Utility.returnSuccess(messages);
                })
                .catch(function(error) {
                  // for submit tx
                  console.log(error);
                  var errorMessages = Utility.extractError(error);
                  errorMessages.forEach(function(m) {
                    messages.push(m);
                  });

                  throw new Error('TxError');

                })
                .catch(function(error) {
                  // catch all
                  console.log(error);
                  messages.push('Unable to complete allow trust operation');
                  return Utility.returnError(messages);

                });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


            // return $http({
            //     method: 'POST',
            //     url: baseUrl+'allowtrust',
            //     headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
            //                 'Authorization': 'JWT '+trustData.token },
            //     data: $.param(trustData)
            // });
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

          console.log(offerData);
            var messages = [];
            var buyingAsset = Utility.generateAsset(offerData.buyingAssetType,offerData.buyingAssetCode, offerData.buyingAssetIssuer);
            var sellingAsset = Utility.generateAsset(offerData.sellingAssetType,offerData.sellingAssetCode, offerData.sellingAssetIssuer);
            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(offerData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {


              if (offerData.sellingAssetType > 0) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(offerData.sellingAssetIssuer) || !sellingAsset) {
                  messages.push('Invalid Selling Asset. Code must be alphanumeric and Issuer must be a valid stellar account');
                  return Utility.returnError(messages);
                 }

              }

              if (req.body.buyingAssetType > 0) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(req.body.buyingAssetIssuer) || !buyingAsset) {
                    messages.push('Invalid Buying Asset. Code must be alphanumeric and Issuer must be a valid stellar account');
                    return Utility.returnError(messages);
                }

              }

              // check if source account is active
              return server.loadAccount(offerData.account_id)
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.selling = sellingAsset;
                  operationObj.buying = buyingAsset;
                  operationObj.amount = offerData.amount;
                  operationObj.price = offerData.price;

                  if (offerData.offerId) {
                    operationObj.offerId = offerData.offerId;
                  }

                  transaction.addOperation(StellarSDK.Operation.manageOffer(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(trustData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, offerData.tx_passphrase)));
                  // console.log("BTX", builtTx.toEnvelope().toXDR().toString("base64"));
                  return server.submitTransaction(builtTx);

                })
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(xdrResult) {
                  messages.push('Manage offer operation successful');
                  return Utility.returnSuccess(messages);
                })
                .catch(function(error) {
                  // for submit tx
                  console.log(error);
                  var errorMessages = Utility.extractError(error);
                  errorMessages.forEach(function(m) {
                    messages.push(m);
                  });

                  throw new Error('TxError');

                })
                .catch(function(error) {
                  // catch all
                  console.log(error);
                  messages.push('Unable to complete manage offer operation');
                  return Utility.returnError(messages);

                });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


            // return $http({
            //     method: 'POST',
            //     url: baseUrl+'manageoffer',
            //     headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
            //                 'Authorization': 'JWT '+offerData.token },
            //     data: $.param(offerData)
            // });
        },

        passiveOffer : function(offerData) {

          console.log(offerData);
            var messages = [];
            var buyingAsset = Utility.generateAsset(offerData.buyingAssetType,offerData.buyingAssetCode, offerData.buyingAssetIssuer);
            var sellingAsset = Utility.generateAsset(offerData.sellingAssetType,offerData.sellingAssetCode, offerData.sellingAssetIssuer);
            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(offerData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {


              if (offerData.sellingAssetType > 0) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(offerData.sellingAssetIssuer) || !sellingAsset) {
                  messages.push('Invalid Selling Asset. Code must be alphanumeric and Issuer must be a valid stellar account');
                  return Utility.returnError(messages);
                 }

              }

              if (req.body.buyingAssetType > 0) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(req.body.buyingAssetIssuer) || !buyingAsset) {
                    messages.push('Invalid Buying Asset. Code must be alphanumeric and Issuer must be a valid stellar account');
                    return Utility.returnError(messages);
                }

              }

              // check if source account is active
              return server.loadAccount(offerData.account_id)
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.selling = sellingAsset;
                  operationObj.buying = buyingAsset;
                  operationObj.amount = offerData.amount;
                  operationObj.price = offerData.price;

                  transaction.addOperation(StellarSDK.Operation.createPassiveOffer(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(trustData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, offerData.tx_passphrase)));
                  // console.log("BTX", builtTx.toEnvelope().toXDR().toString("base64"));
                  return server.submitTransaction(builtTx);

                })
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(xdrResult) {
                  messages.push('Create passive offer operation successful');
                  return Utility.returnSuccess(messages);
                })
                .catch(function(error) {
                  // for submit tx
                  console.log(error);
                  var errorMessages = Utility.extractError(error);
                  errorMessages.forEach(function(m) {
                    messages.push(m);
                  });

                  throw new Error('TxError');

                })
                .catch(function(error) {
                  // catch all
                  console.log(error);
                  messages.push('Unable to complete create passive offer operation');
                  return Utility.returnError(messages);

                });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


            // return $http({
            //     method: 'POST',
            //     url: baseUrl+'passiveoffer',
            //     headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
            //                 'Authorization': 'JWT '+offerData.token },
            //     data: $.param(offerData)
            // });
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
            // get hash of passphrase, 
            var passphraseHash = Utility.getHash(userData.password);

            // save hash locally,
            $rootScope.currentUser.passphraseHash = passphraseHash;

            userData.password = "";//remove password
            userData.passwordHash = passphraseHash;

            // save hash in server
            return $http({
                method: 'POST',
                url: baseUrl+'savepassphrase',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },

        // change passphrase
        changePassphrase : function(userData) {
            // compare old passphrase for match, 
            console.log(userData);

            var isValid = Utility.validatePassphrase(userData.old_passphrase, $rootScope.currentUser.tx_passphrase);
            console.log("isValid: ", isValid);
            if (isValid) {
                var passphraseHash = Utility.getHash(userData.passphrase);

                // save hash locally,
                $rootScope.currentUser.passphraseHash = passphraseHash;

                userData.password = "";//remove password
                userData.passwordHash = passphraseHash;

                // save hash in server
                return $http({
                    method: 'POST',
                    url: baseUrl+'changepassphrase',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                'Authorization': 'JWT '+userData.token  },
                    data: $.param(userData)
                });


            } else{
                return new Promise(function(resolve, reject) {
                    var errObj = {
                                    content: {
                                        message: ['Invalid passphrase']
                                    }
                                  };
                    reject(errObj);
                });
            }


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
                url: 'https://api.cryptonator.com/api/ticker/xlm-usd',


            });
        },
        getBTC : function(token) {
             return $http({
                method: 'GET',
                url: 'https://api.cryptonator.com/api/ticker/xlm-btc',

            });
        },

    };

});
