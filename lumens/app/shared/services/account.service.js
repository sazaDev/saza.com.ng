// Account Service

var StellarSDK = StellarSdk;
var Utility = Utility;
var Config = Config;
// var forge = require('node-forge');
var account = angular.module('accountService', []);
// var baseUrl = 'https://saza.com.ng:8888/';
var baseUrl = Config.General.baseUrl;

var server = "";

if ( Config.General.production === 'live') {
  StellarSDK.Network.usePublicNetwork();
  server = new StellarSDK.Server(Config.Stellar.liveNetwork);

}else
{
  StellarSDK.Network.useTestNetwork();
  server = new StellarSDK.Server(Config.Stellar.testNetwork);
}


account.factory('Account', function($http, $rootScope) {

  var  self = {};

    self = {


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

        getAccount : function(token,account_id) {
            return $http({
                method: 'GET',
                url: baseUrl+'getaccount/?token='+token+'&account_id='+account_id,
                headers: { 'Authorization': 'JWT '+token },

            });
        },

        createAsset : function(paymentData) {
          // check if passphrase is valid
          // check if dist/issuer are valid
          // create trustline between dist and issuer
          // send amount of asset to be created to dist
          // sign transaction
          // send xdr to server for submission

          console.log(paymentData);
            var messages = [];
            var issuerAcct = "";
            var baseAcct = "";
            var setFlags = 0;

            var asset = Utility.generateAsset(paymentData.assetType, paymentData.assetCode, paymentData.issuer);

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(paymentData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

            if (!asset) {
              return Utility.returnError(['Invalid Asset']);
            } else if (paymentData.issuer === paymentData.baseAcct) {
              return Utility.returnError(['Issuing and Distributing accounts can not be the same']);
            } else{

              // check if issuer and dest are valid
              // load issuer account
              return server.loadAccount(paymentData.issuer)
                .catch(StellarSDK.NotFoundError, function(error) {

                messages.push('Issuer Account not active');
                throw new Error('InvalidIssuer');

                })
                .then(function(issuer) {
                  issuerAcct = issuer;
                  // Load base account on stellar
                  return server.loadAccount(paymentData.baseAcct);
                })
                .catch(StellarSDK.NotFoundError, function(error) {

                messages.push('Distributing Account not active');
                throw new Error('InvalidIssuer');

                })
                .then(function(base) {
                  baseAcct = base;
                  var operationObj = {};
                  // create transaction builder
                  var transaction = new StellarSDK.TransactionBuilder(baseAcct);

                  if (paymentData.requireAuth) {
                    setFlags += 1;
                  }

                  if (paymentData.revokeAuth) {
                    setFlags += 2;
                  }
                  // set flag options
                  if (setFlags > 0) {
                    operationObj.setFlags = setFlags;
                    operationObj.source = paymentData.issuer;
                    transaction.addOperation(StellarSDK.Operation.setOptions(operationObj));
                  }

                  // change trust
                  operationObj = {};
                  operationObj.asset = asset;
                  operationObj.source = paymentData.baseAcct;
                  transaction.addOperation(StellarSDK.Operation.changeTrust(operationObj));

                  // allow trust
                  if (setFlags > 0) {
                    operationObj = {};
                    operationObj.trustor = paymentData.baseAcct;
                    operationObj.assetCode = paymentData.assetCode;
                    operationObj.authorize = true;
                    operationObj.source = paymentData.issuer;
                    transaction.addOperation(StellarSDK.Operation.allowTrust(operationObj));
                  }

                  // send asset to dist
                  operationObj = {};
                  operationObj.destination = paymentData.baseAcct;
                  operationObj.asset = asset;
                  operationObj.amount = paymentData.amount.toString();
                  operationObj.source = paymentData.issuer;
                  transaction.addOperation(StellarSDK.Operation.payment(operationObj));

                  // place offer on stellar DEX
                  if (paymentData.distType) {
                    operationObj = {};
                    operationObj.selling = asset;
                    operationObj.buying = StellarSDK.Asset.native();
                    operationObj.amount = paymentData.distAmount.toString();
                    operationObj.price = paymentData.distPrice;
                    operationObj.source = paymentData.baseAcct;
                    transaction.addOperation(StellarSDK.Operation.manageOffer(operationObj));
                  }


                  // get seed
                  var issuerSeed = Utility.getSeedObj(paymentData.issuer, $rootScope.currentUser.accounts);
                  var baseSeed = Utility.getSeedObj(paymentData.baseAcct, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(issuerSeed, paymentData.tx_passphrase)));
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(baseSeed, paymentData.tx_passphrase)));

                  //send build tx to server
                  paymentData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                  return $http({
                      method: 'POST',
                      url: baseUrl+'createasset',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+paymentData.token },
                      data: $.param(paymentData)
                  });

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

                    console.error(error);
                    return Utility.returnError(messages);

                });

            }


            } else{
                return Utility.returnError(['Invalid passphrase']);
            }
        },


        sendPayment : function(paymentData) {

          console.log(paymentData);

            var destValid = true; //boolean for checking if destAcct is Valid
            var sourceValid = true; //boolean for checking if srcAcct is Valid
            var rcvrAcct = "";
            if(!paymentData.memoText){
              paymentData.memoText = "";
            }

            var messages = [];
            // checks in input formats are valid
            var validateInput = Utility.validatePaymentInput(paymentData.destAcct, paymentData.amount, paymentData.memoText);

            var asset = Utility.generateAsset(paymentData.assetType, paymentData.assetCode, paymentData.assetIssuer);

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(paymentData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

            if (!validateInput.status || !asset) {
              return Utility.returnError(validateInput.content.message);
            } else{

              // check if destAcct is stellar address or account ID
              // load destAcct to see if it exists on Stellar

            return  StellarSDK.FederationServer.resolve(paymentData.destAcct)
              .catch(function(error) {
                console.log("Error",error);
                var errorMessages = Utility.extractError(error);
                errorMessages.forEach(function(m) {
                  messages.push(m);
                });
                throw new Error('AccountNotFound');
              })
              .then(function(acctDetails) {
                console.log("acctDetails", acctDetails);
                rcvrAcct = acctDetails;
                // load dest account
                return server.loadAccount(acctDetails.account_id);
              })
              .catch(StellarSDK.NotFoundError, function(error) {

                messages.push('Destination Account not active');
                messages.push('Attempt to create destination account');
                // destAcct not found
                if (asset.isNative()) {
                  destValid = false;

                }else{
                  destValid = false;
                  messages.push('Can not create destination account with custom asset');
                  throw new Error('Invalid Destination and Custom Asset');
                }
                // continue to next then block
              })
              .then(function() {

                // Load source account on stellar
                return server.loadAccount(paymentData.account_id);
              })
              .catch(StellarSDK.NotFoundError, function(error) {

                // unable to load source account
                messages.push('Source Account not active');
                throw new Error('SourceInactive');

              })
              .then(function(sender) {

                // build a transaction based on if destination is valid or not.

                var transaction = "";

                if (destValid) {
                  // send payment
                  console.log("sending Payment");
                  transaction = new StellarSDK.TransactionBuilder(sender)
                                    .addOperation(StellarSDK.Operation.payment({
                                      destination: rcvrAcct.account_id,
                                      asset: asset,
                                      amount: paymentData.amount.toString()
                                    }))
                                    .addMemo(StellarSDK.Memo.text(paymentData.memoText))
                                    .build();

                } else{
                  // fund new account
                  console.log("funding new account");
                  transaction = new StellarSDK.TransactionBuilder(sender)
                                    .addOperation(StellarSDK.Operation.createAccount({
                                      destination: rcvrAcct.account_id,
                                      startingBalance: paymentData.amount.toString()
                                    }))
                                    .addMemo(StellarSDK.Memo.text(paymentData.memoText))
                                    .build();

                }


                // get seed
                var seedObj = Utility.getSeedObj(paymentData.account_id, $rootScope.currentUser.accounts);

                // sign transaction
                transaction.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, paymentData.tx_passphrase)));

                //send build tx to server
                paymentData.builtTx = transaction.toEnvelope().toXDR().toString("base64");


                return $http({
                    method: 'POST',
                    url: baseUrl+'sendpayment',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                'Authorization': 'JWT '+paymentData.token },
                    data: $.param(paymentData)
                });

              })
              // .then(function(result) {
              //   console.log('Success! Results:', result);
              //   messages.push('Transaction Successful');
              //   return Utility.returnSuccess(messages);
              // })
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
                console.error('Something went wrong at the end\n', error);
                messages.push('Transaction Failed');
                return Utility.returnError(messages);
              });
            }


            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


        },

        emailTx : function(paymentData) {

          console.log(paymentData);

            var destValid = true; //boolean for checking if destAcct is Valid
            var sourceValid = true; //boolean for checking if srcAcct is Valid
            var rcvrAcct = {};
            var claimCode = Utility.randomString(6);
            var emailFound = 0;
            var destAcctActive = 0;
            if(!paymentData.memoText){
              paymentData.memoText = "";
            }
            // get seed
            var seedObj = Utility.getSeedObj(paymentData.account_id, $rootScope.currentUser.accounts);


            var messages = [];
            // checks in input formats are valid
            // var validateInput = Utility.validatePaymentInput(paymentData.destAcct, paymentData.amount, paymentData.memoText);

            var asset = Utility.generateAsset(paymentData.assetType, paymentData.assetCode, paymentData.assetIssuer);

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(paymentData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

            if (!asset) {
              return Utility.returnError(['Invalid Input: Asset is not defined']);
            } else{

              var queryStr = paymentData.destAcct+"*"+Config.Stellar.homeDomain;

              // find email via saza federation
              return StellarSDK.FederationServer.resolve(queryStr)
              .catch(function(error) {
                console.log("Error",error);
                // Account not found continue to then block
              })
              .then(function(acctDetails) {

                if (acctDetails) {
                  rcvrAcct = acctDetails;
                  emailFound = 1;
                } else{
                  console.log("not found creating pair\n");
                  var pair = StellarSDK.Keypair.random();

                  rcvrAcct.account_id = pair.publicKey();
                  rcvrAcct.seed = pair.secret();
                  emailFound = 0;
                }

                console.log(rcvrAcct);

                // load dest account
                return server.loadAccount('GCVNC7MZV3Z3SNUMYIJGSQS3IMNHIF7FZC2HGL5FDBKPDUATXBTVQNDJ');
              })
              .then(function(receiver) {
                console.log("receiver: ", receiver);
                if (receiver) {
                  console.log("its active oo");
                  destAcctActive = 1;

                }
                // load source acct
                return server.loadAccount(paymentData.account_id);
              })
              .catch(StellarSDK.NotFoundError, function(error) {
                console.log(error);
                messages.push('Destination Account not active');
                messages.push('Attempt to create destination account');
                destAcctActive = 0;

                // continue to next then block
              })
              .then(function(sender) {

                // build a transaction based on if email was found or not

                var transaction = "";

                if (emailFound) {
                  // send payment
                  console.log("Sending Payment");
                  if (destAcctActive == 1) {
                    transaction = new StellarSDK.TransactionBuilder(sender)
                                    .addOperation(StellarSDK.Operation.payment({
                                      destination: rcvrAcct.account_id,
                                      asset: asset,
                                      amount: paymentData.amount.toString()
                                    }))
                                    .addMemo(StellarSDK.Memo.text(paymentData.memoText))
                                    .build();
                  }
                  if (destAcctActive === 0) {
                    transaction = new StellarSDK.TransactionBuilder(sender)
                                      .addOperation(StellarSDK.Operation.createAccount({
                                        destination: rcvrAcct.account_id,
                                        startingBalance: paymentData.amount.toString()
                                      }))
                                      .addMemo(StellarSDK.Memo.text(paymentData.memoText))
                                      .build();
                  }

                  // sign transaction
                  transaction.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, paymentData.tx_passphrase)));


                } else{
                  // fund new account and add signer
                  console.log("funding new account");
                  var operationObj = {};
                  operationObj.signer = {};
                  operationObj.signer.ed25519PublicKey = paymentData.account_id;
                  operationObj.signer.weight = 1;
                  operationObj.source = rcvrAcct.account_id;

                  transaction = new StellarSDK.TransactionBuilder(sender)
                                    .addOperation(StellarSDK.Operation.createAccount({
                                      destination: rcvrAcct.account_id,
                                      startingBalance: paymentData.amount.toString()
                                    }))
                                    .addOperation(StellarSDK.Operation.setOptions(operationObj))
                                    .addMemo(StellarSDK.Memo.text(paymentData.memoText))
                                    .build();
                  // sign transaction


                  transaction.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, paymentData.tx_passphrase)));
                  transaction.sign(StellarSDK.Keypair.fromSecret(rcvrAcct.seed));
                }

                //send build tx to server
                paymentData.builtTx = transaction.toEnvelope().toXDR().toString("base64");
                paymentData.emailFound = emailFound;
                paymentData.rcvrAcct = rcvrAcct;
                if (emailFound === 0) {
                  // set claimCode
                  paymentData.claim_code = claimCode;

                  // encrypt seed
                  paymentData.rcvrAcct.seedObj = Utility.encrypt(claimCode, paymentData.rcvrAcct.seed);
                }
                return $http({
                    method: 'POST',
                    url: baseUrl+'emailtx',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                'Authorization': 'JWT '+paymentData.token },
                    data: $.param(paymentData)
                });


              })
              .catch(StellarSDK.NotFoundError, function(error) {
                console.log(error);
                // unable to load source account
                messages.push('Source Account not active');
                console.error('Something went wrong! The source account does not exist!');
                throw new Error('SourceInactive');

              })
              .catch(function(error) {
                console.error('Something went wrong at the end\n', error);
                messages.push('Transaction Failed');
                return Utility.returnError(messages);
              });
            }


            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


        },
        getClaims : function(token,account_id,id) {

            return $http({
                method: 'GET',
                url: baseUrl+'getclaims/?token='+token+'&account_id='+account_id+'&id='+id,
                headers: { 'Authorization': 'JWT '+token },

            });
        },

        findClaim : function(paymentData) {

            return $http({
                method: 'POST',
                url: baseUrl+'findclaim',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+paymentData.token},
                data: $.param(paymentData)
            });
        },

        userClaimLumens : function(paymentData) {
            console.log(paymentData);
            var messages = [];
            var seedObj = {};
            var emailTxObj = {};
            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(paymentData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {
              return self.findClaim(paymentData)
                  .then(function(resp) {

                    emailTxObj = resp.data.content.data;
                    seedObj = { 'text': emailTxObj.rcvr_skey,
                                'salt': emailTxObj.rcvr_salt,
                                'iv': emailTxObj.rcvr_iv
                              };
                    // load rcvr account from stellar network
                    return server.loadAccount(emailTxObj.rcvr_account_id);

                  })
                  .catch(function(error) {
                    messages.push('Claim not found. Invalid details');
                    throw Error('InvalidDetails');
                  })
                  .catch(StellarSDK.NotFoundError, function(error) {

                    // unable to load source account
                    messages.push('Source Account not active');
                    console.error('Something went wrong! The source account does not exist!');
                    throw Error('InvalidDetails');
                  })
                  .then(function(srcAcct) {

                      // remove sender as signer and set home domain
                      var operationObj = {};
                      operationObj.signer = {};
                      operationObj.signer.ed25519PublicKey = emailTxObj.sender_account_id;
                      operationObj.signer.weight = 0;
                      operationObj.homeDomain = Config.Stellar.homeDomain;

                      transaction = new StellarSDK.TransactionBuilder(srcAcct)
                                        .addOperation(StellarSDK.Operation.setOptions(operationObj))
                                        .build();
                      // sign transaction

                      transaction.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, paymentData.claim_code)));
                      //send build tx to server
                      paymentData.builtTx = transaction.toEnvelope().toXDR().toString("base64");
                      // encrypt with tx passphrase
                      var newSeedObj = Utility.encrypt(paymentData.tx_passphrase, Utility.decrypt(seedObj, paymentData.claim_code));
                      paymentData.seedObj = newSeedObj;
                      paymentData.rcvr_account_id = emailTxObj.rcvr_account_id;

                      // send to server for submission and update
                      return $http({
                          method: 'POST',
                          url: baseUrl+'userclaimlumens',
                          headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                      'Authorization': 'JWT '+paymentData.token },
                          data: $.param(paymentData)
                      });
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

                    console.error(error);
                    return Utility.returnError(messages);

                  });

            }
            else{
              return Utility.returnError(['Invalid passphrase']);
            }

        },

        revokeLumens : function(paymentData) {
          console.log(paymentData);
          var messages = [];

          // prepare merge transaction and send to server
          return server.loadAccount(paymentData.txObj.rcvr_account_id)
            .catch(StellarSDK.NotFoundError, function(error) {

              // unable to load source account
              messages.push('Source Account not active');
              console.error('Something went wrong! The source account does not exist!');
              throw new Error('SourceInactive');

            })
            .then(function(srcAcct) {

              // Build Transaction
              var transaction = new StellarSDK.TransactionBuilder(srcAcct)
                                  .addOperation(StellarSDK.Operation.accountMerge({
                                    destination: paymentData.txObj.sender_account_id
                                  }))
                                  .build();

              // get seed
              var seedObj = { 'text': paymentData.txObj.rcvr_skey,
                              'salt': paymentData.txObj.rcvr_salt,
                              'iv': paymentData.txObj.rcvr_iv
                            };

              // sign transaction
              transaction.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, paymentData.txObj.claim_code)));

              //send build tx to server
              paymentData.builtTx = transaction.toEnvelope().toXDR().toString("base64");

              // return success of merge from server and update email tx

              return $http({
                  method: 'POST',
                  url: baseUrl+'reclaimemailtx',
                  headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                              'Authorization': 'JWT '+paymentData.token },
                  data: $.param(paymentData)
              });

            });


        },
        // Deprecated do not use
        claimLumens : function(paymentData) {

            return $http({
                method: 'POST',
                url: baseUrl+'claimemailtx',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
                data: $.param(paymentData)
            });
        },

        pathPayment : function(paymentData) {

          console.log(paymentData);

            var destValid = true; //boolean for checking if destAcct is Valid
            var sourceValid = true; //boolean for checking if srcAcct is Valid
            var rcvrAcct = "";
            if(!paymentData.memoText){
              paymentData.memoText = "";
            }

            var messages = [];
            // checks in input formats are valid
            var validateInput = Utility.validatePaymentInput(paymentData.destAcct, paymentData.amount, paymentData.memoText);

            var sendAsset = Utility.generateAsset(paymentData.sendAssetType, paymentData.sendAssetCode, paymentData.sendAssetIssuer);
            var destAsset = Utility.generateAsset(paymentData.destAssetType, paymentData.destAssetCode, paymentData.destAssetIssuer);


            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(paymentData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

              if (!validateInput.status || !sendAsset || !destAsset) {
                validateInput.content.message.push("Ensure all inputs are valid");
                return Utility.returnError(validateInput.content.message);
              } else{

                StellarSDK.FederationServer.resolve(paymentData.destAcct)
                .catch(function(error) {
                  console.log("Error",error);
                  console.log("Error",error);
                  var errorMessages = Utility.extractError(error);
                  errorMessages.forEach(function(m) {
                    messages.push(m);
                  });
                  throw new Error('AccountNotFound');
                })
                .then(function(acctDetails) {
                  console.log("acctDetails", acctDetails);
                  rcvrAcct = acctDetails;
                  // load dest account
                  return server.loadAccount(acctDetails.account_id);
                })
                .catch(StellarSDK.NotFoundError, function(error) {

                  messages.push('Destination Account not active');
                  throw new Error('DestinationInactive');

                })
                .then(function() {

                  // Load source account on stellar
                  return server.loadAccount(paymentData.account_id);
                })
                .catch(StellarSDK.NotFoundError, function(error) {

                  // unable to load source account
                  messages.push('Source Account not active');
                  throw new Error('SourceInactive');

                })
                .then(function(sender) {

                  // send payment

                  var transaction = new StellarSDK.TransactionBuilder(sender);

                  var operationObj = {};
                  operationObj.sendAsset = sendAsset;
                  operationObj.sendMax = paymentData.sendMax;
                  operationObj.destination = paymentData.account_id;
                  operationObj.destAsset = destAsset;
                  operationObj.destAmount = paymentData.destAmount.toString();

                  transaction.addOperation(StellarSDK.Operation.pathPayment(operationObj));
                  transaction.addMemo(StellarSDK.Memo.text(paymentData.memoText));

                  // get seed
                  var seedObj = Utility.getSeedObj(paymentData.account_id, $rootScope.currentUser.accounts);


                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, paymentData.tx_passphrase)));
                  paymentData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                  return $http({
                      method: 'POST',
                      url: baseUrl+'pathpayment',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+paymentData.token },
                      data: $.param(paymentData)
                  });


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
                  console.error('Something went wrong at the end\n', error);
                  messages.push('Transaction Failed');
                  return Utility.returnError(messages);
                });
              }


            } else{
              return Utility.returnError(['Invalid passphrase']);
            }



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
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(srcAcct) {

                  var asset = new StellarSDK.Asset(trustData.assetCode, trustData.assetIssuer);
                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                      operationObj.asset = asset;

                  if (trustData.limit !== null && (typeof(trustData.limit) !== 'undefined')) {

                    operationObj.limit = trustData.limit.toString();
                  }


                  transaction.addOperation(StellarSDK.Operation.changeTrust(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(trustData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, trustData.tx_passphrase)));
                  trustData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");
                  return $http({
                      method: 'POST',
                      url: baseUrl+'changetrust',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+trustData.token },
                      data: $.param(trustData)
                  });

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
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.trustor = trustData.trustor;
                  operationObj.assetCode = trustData.assetCode;
                  operationObj.authorize = trustData.authorize;

                  transaction.addOperation(StellarSDK.Operation.allowTrust(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(trustData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, trustData.tx_passphrase)));

                  trustData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                  return $http({
                      method: 'POST',
                      url: baseUrl+'allowtrust',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+trustData.token },
                      data: $.param(trustData)
                  });

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

              if (offerData.buyingAssetType > 0) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(offerData.buyingAssetIssuer) || !buyingAsset) {
                    messages.push('Invalid Buying Asset. Code must be alphanumeric and Issuer must be a valid stellar account');
                    return Utility.returnError(messages);
                }

              }

              // check if source account is active
              return server.loadAccount(offerData.account_id)
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.selling = sellingAsset;
                  operationObj.buying = buyingAsset;
                  operationObj.amount = offerData.amount.toString();
                  operationObj.price = offerData.price;

                  if (offerData.offerId) {
                    operationObj.offerId = offerData.offerId;
                  }

                  transaction.addOperation(StellarSDK.Operation.manageOffer(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(offerData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, offerData.tx_passphrase)));

                  offerData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                  return $http({
                      method: 'POST',
                      url: baseUrl+'manageoffer',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+offerData.token },
                      data: $.param(offerData)
                  });


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

              if (offerData.buyingAssetType > 0) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(offerData.buyingAssetIssuer) || !buyingAsset) {
                    messages.push('Invalid Buying Asset. Code must be alphanumeric and Issuer must be a valid stellar account');
                    return Utility.returnError(messages);
                }

              }

              // check if source account is active
              return server.loadAccount(offerData.account_id)
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  throw new Error('SourceInactive');
                })
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.selling = sellingAsset;
                  operationObj.buying = buyingAsset;
                  operationObj.amount = offerData.amount.toString();
                  operationObj.price = offerData.price;

                  transaction.addOperation(StellarSDK.Operation.createPassiveOffer(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(offerData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, offerData.tx_passphrase)));
                  offerData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                  return $http({
                      method: 'POST',
                      url: baseUrl+'passiveoffer',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+offerData.token },
                      data: $.param(offerData)
                  });

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


        },

        setOptions : function(userData) {
          console.log(userData);
            var messages = [];

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(userData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

              // check if source account is active
              return server.loadAccount(userData.account_id)
                      .catch(StellarSDK.NotFoundError, function(error) {
                        // for load source account
                        messages.push('Source Account is not active');
                        throw new Error('SourceInactive');
                      })

                      .then(function(srcAcct) {

                        var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                        var operationObj = {};
                        var setFlags = 0;
                        var clearFlags = 0;

                        if (userData.setFlags) {
                          if (userData.setFlags.authRq) {
                            setFlags += parseInt(userData.setFlags.authRq);
                          }
                          if (userData.setFlags.authRv) {
                            setFlags += parseInt(userData.setFlags.authRv);
                          }
                          if (userData.setFlags.authIm) {
                            setFlags += parseInt(userData.setFlags.authIm);
                          }
                        }

                        if (userData.clearFlags) {
                          if (userData.clearFlags.authRq) {
                            clearFlags += parseInt(userData.clearFlags.authRq);
                          }
                          if (userData.clearFlags.authRv) {
                            clearFlags += parseInt(userData.clearFlags.authRv);
                          }
                          if (userData.clearFlags.authIm) {
                            clearFlags += parseInt(userData.clearFlags.authIm);
                          }
                        }

                        if(userData.inflationDest){
                          operationObj.inflationDest = userData.inflationDest;
                        }

                        if (setFlags > 0) {
                          operationObj.setFlags = setFlags;
                        }

                        if (clearFlags > 0) {
                          operationObj.clearFlags = clearFlags;
                        }

                        if (userData.masterWeight) {
                          operationObj.masterWeight = userData.masterWeight;
                        }

                        if (userData.lowThreshold) {
                          operationObj.lowThreshold = userData.lowThreshold;
                        }

                        if (userData.medThreshold) {
                          operationObj.medThreshold = userData.medThreshold;
                        }

                        if (userData.highThreshold) {
                          operationObj.highThreshold = userData.highThreshold;
                        }

                        if (userData.signerType && userData.signerKey && userData.signerWeight) {
                          operationObj.signer = {};

                          if (userData.signerType == 0) {
                            operationObj.signer.ed25519PublicKey = userData.signerKey;
                            operationObj.signer.weight = userData.signerWeight;
                          }

                          if (userData.signerType == 1) {
                            operationObj.signer.sha256Hash = userData.signerKey;
                            operationObj.signer.weight = userData.signerWeight;
                          }

                          if (userData.signerType == 2) {
                            operationObj.signer.preAuthTx = userData.signerKey;
                            operationObj.signer.weight = userData.signerWeight;
                          }
                        }

                        if (userData.homeDomain) {
                          operationObj.homeDomain = userData.homeDomain;
                        }

                        console.log("operationObj",operationObj);

                        if (Utility.isEmpty(operationObj)) {
                          messages.push('No options given');
                          throw new Error('EmptyObject');
                        } else{
                          transaction.addOperation(StellarSDK.Operation.setOptions(operationObj));

                          // get seed
                          var seedObj = Utility.getSeedObj(userData.account_id, $rootScope.currentUser.accounts);

                          // build and sign transaction
                          var builtTx = transaction.build();
                          builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, userData.tx_passphrase)));

                          userData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");
                          return $http({
                              method: 'POST',
                              url: baseUrl+'setoptions',
                              headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                          'Authorization': 'JWT '+userData.token },
                              data: $.param(userData)
                          });
                        }

                      })
                      // .then(function(xdrResult) {
                      //   messages.push('Set Options operation successful');
                      //   return Utility.returnSuccess(messages);

                      // })
                      // .catch(function(error) {
                      //   // for submit tx
                      //   console.log("error", error);
                      //   var errorMessages = Utility.extractError(error);
                      //   errorMessages.forEach(function(m) {
                      //     messages.push(m);
                      //   });

                      //   throw new Error('TxError');

                      // })
                      .catch(function(error) {
                        // catch all
                        console.log("error", error);
                        messages.push('Unable to complete set options operation');
                        return Utility.returnError(messages);
                      });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }




        },


        setUsername : function(userData) {


          console.log(userData);
            var messages = [];

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(userData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

              // check if source account is active
              return server.loadAccount(userData.account_id)
                .then(function(srcAcct) {


                  var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                  var operationObj = {};
                  operationObj.inflationDest = Config.General.production ? Config.Stellar.inflationDest : Config.Stellar.testInflationDest;
                  operationObj.homeDomain = Config.General.production ?  Config.Stellar.homeDomain : Config.Stellar.testHomeDomain;

                  transaction.addOperation(StellarSDK.Operation.setOptions(operationObj));
                  // get seed
                  var seedObj = Utility.getSeedObj(userData.account_id, $rootScope.currentUser.accounts);

                  // build and sign transaction
                  var builtTx = transaction.build();
                  builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, userData.tx_passphrase)));
                   // console.log("BTX", builtTx.toEnvelope().toXDR().toString("base64"));
                  //send build tx to server
                  userData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                  console.log(userData);
                  return $http({
                      method: 'POST',
                      url: baseUrl+'setusername',
                      headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                  'Authorization': 'JWT '+userData.token },
                      data: $.param(userData)
                  });

                })
                .catch(StellarSDK.NotFoundError, function(error) {
                  // for load source account
                  console.log(error);
                  messages.push('Source Account is not active');
                  return Utility.returnError(messages);
                });


            } else{
                return Utility.returnError(['Invalid passphrase']);
            }



        },
        // DEPRECATED. DONT USE
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
            var messages = [];

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(userData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {
                if (!StellarSDK.StrKey.isValidEd25519PublicKey(userData.destAcct)) {
                  messages.push('Destination must be a valid stellar account id');
                  return Utility.returnError(messages);
                }

                return server.loadAccount(userData.account_id)
                        .catch(StellarSDK.NotFoundError, function(error) {
                          // for load source account
                          messages.push('Source Account is not active');
                          throw new Error('SourceInactive');
                        })
                        .then(function(srcAcct) {

                          // Build Transaction
                          var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                          var operationObj = {};
                          operationObj.destination = userData.destAcct;

                          transaction.addOperation(StellarSDK.Operation.accountMerge(operationObj));

                          // get seed
                          var seedObj = Utility.getSeedObj(userData.account_id, $rootScope.currentUser.accounts);

                          // build and sign transaction
                          var builtTx = transaction.build();
                          builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, userData.tx_passphrase)));
                          userData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                          return $http({
                              method: 'POST',
                              url: baseUrl+'mergeaccount',
                              headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                          'Authorization': 'JWT '+userData.token },
                              data: $.param(userData)
                          });



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
                          messages.push('Unable to complete merge account operation');
                          return Utility.returnError(messages);

                        });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


        },

        manageData : function(manageData) {
            var messages = [];

            // check if passphrase is valid,
            var isValid = Utility.validatePassphrase(manageData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
            if (isValid) {

                return server.loadAccount(manageData.account_id)
                        .catch(StellarSDK.NotFoundError, function(error) {
                          // for load source account
                          messages.push('Source Account is not active');
                          throw new Error('SourceInactive');
                        })
                        .then(function(srcAcct) {

                          // Build Transaction
                          var transaction = new StellarSDK.TransactionBuilder(srcAcct);
                          var operationObj = {};
                          operationObj.name = manageData.entryName;
                          if (!manageData.entryValue) {
                            operationObj.value = null;
                          }else{
                            operationObj.value = manageData.entryValue;
                          }

                          console.log("operationObj",operationObj);

                          transaction.addOperation(StellarSDK.Operation.manageData(operationObj));

                          // get seed
                          var seedObj = Utility.getSeedObj(manageData.account_id, $rootScope.currentUser.accounts);

                          // build and sign transaction
                          var builtTx = transaction.build();
                          builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, manageData.tx_passphrase)));

                          manageData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");

                          return $http({
                              method: 'POST',
                              url: baseUrl+'managedata',
                              headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                          'Authorization': 'JWT '+manageData.token },
                              data: $.param(manageData)
                          });

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
                          messages.push('Unable to complete manage data operation');
                          return Utility.returnError(messages);

                        });

            } else{
                return Utility.returnError(['Invalid passphrase']);
            }


            
        },

        getTransactions : function(token,account_id) {

            return $http({
                method: 'GET',
                url: baseUrl+'gettransactions/?token='+token+'&account_id='+account_id,
                headers: { 'Authorization': 'JWT '+token },

            });
        },




        addAnchor : function(anchorData) {

          var tomlObject = {};
          console.log(anchorData);
          var messages = [];
          
          // check if passphrase is valid,
          var isValid = Utility.validatePassphrase(anchorData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
          if (isValid) {
            return self.getAnchorAssets(anchorData)
                  .then(function(resp) {

                    tomlObject = resp.data.content.data;
                    console.log(tomlObject);
                    // load account
                    return server.loadAccount(anchorData.account_id);
                  })
                  .catch(function(error) {
                    messages = error.data.content.message;
                    throw Error('InvalidDetails');
                  })
                  .catch(StellarSDK.NotFoundError, function(error) {
                    messages.push('Source Account is not active');
                    throw new Error('SourceInactive');
                  })
                  .then(function(srcAcct) {

                    var transaction = new StellarSDK.TransactionBuilder(srcAcct);

                     // create trustline ops for each asset
                    tomlObject.CURRENCIES.forEach(function(currency) {
                        // create new asset
                        console.log("currency", currency);
                        var asset = new StellarSDK.Asset(currency.code, currency.issuer);

                        // loop thru currencies and add to array
                        // sets limit to max value
                        transaction.addOperation(StellarSDK.Operation.changeTrust({
                                        asset: asset
                                      }));
                      });

                      // build and sign transaction
                      var builtTx = transaction.build();
                      // get seed
                      var seedObj = Utility.getSeedObj(anchorData.account_id, $rootScope.currentUser.accounts);

                      builtTx.sign(StellarSDK.Keypair.fromSecret(Utility.decrypt(seedObj, anchorData.tx_passphrase)));
                      //send build tx to server
                      anchorData.builtTx = builtTx.toEnvelope().toXDR().toString("base64");


                      return $http({
                          method: 'POST',
                          url: baseUrl+'addanchor',
                          headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                      'Authorization': 'JWT '+anchorData.token  },
                          data: $.param(anchorData)
                      });

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

                    console.error(error);
                    return Utility.returnError(messages);

                  });

            }
            else{
              return Utility.returnError(['Invalid passphrase']);
            }


        },

        getAnchorAssets : function(anchorData) {
          // get assets, 
          // create trustline ops for each asset
          // sign tx and send to server for submission


            return $http({
                method: 'POST',
                url: baseUrl+'getanchorassets',
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


        changeEncryption : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'changeencryption',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },

        // save passphrase
        savePassphrase : function(userData) {
          var messages = [];
          console.log(userData);
          return self.changeEncryption(userData)
            .then(function(resp) {
              console.log(resp);
              var seedArray = resp.data.content.data;

              console.log(seedArray);

              // encrypt with passphrase
              for (var i = 0; i < seedArray.length; i++) {
                var encryptedObj = Utility.encrypt(userData.password, seedArray[i].seed);
                seedArray[i].encryptedObj = encryptedObj;
                seedArray[i].seed = "";//remove seed
              }

              userData.seedArray = seedArray;

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

              console.error(error);
              return Utility.returnError(messages);

            });


        },

        // change passphrase
        // // Deprecated do not use
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

                // To do rencrypt all seeds and send to server to be saved
                for (var i = 0; i < $rootScope.currentUser.accounts.length; i++) {

                  var encryptedObj = {
                      'text': $rootScope.currentUser.accounts[i].skey,
                      'salt': $rootScope.currentUser.accounts[i].salt,
                      'iv': $rootScope.currentUser.accounts[i].iv
                  };

                  var decryptedSeed = Utility.decrypt(encryptedObj, userData.old_passphrase);

                  var tempObj = Utility.encrypt(userData.passphrase, decryptedSeed);

                  $rootScope.currentUser.accounts[i].skey = tempObj.text;
                  $rootScope.currentUser.accounts[i].salt = tempObj.salt;
                  $rootScope.currentUser.accounts[i].iv = tempObj.iv;
                }

                userData.accountsArray = $rootScope.currentUser.accounts;

                // save hash in server
                return $http({
                    method: 'POST',
                    url: baseUrl+'changepassphrase',
                    headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                                'Authorization': 'JWT '+userData.token  },
                    data: $.param(userData)
                });


            } else{
              return Utility.returnError(['Invalid passphrase']);
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


        get2faSecret : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'get2fasecret',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },

        enable2fa : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'enable2fa',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },


        verify2fa : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'verify2fa',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },

        disable2fa : function(userData) {

            return $http({
                method: 'POST',
                url: baseUrl+'disable2fa',
                headers: { 'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization': 'JWT '+userData.token  },
                data: $.param(userData)
            });
        },


        getSeed : function(userData) {
          var isValid = Utility.validatePassphrase(userData.tx_passphrase, $rootScope.currentUser.tx_passphrase);
          if (isValid) {
            var seedObj = Utility.getSeedObj(userData.account_id, $rootScope.currentUser.accounts);

            var decryptedObj = Utility.decrypt(seedObj, userData.tx_passphrase);
            return Utility.returnSuccess([decryptedObj]);
          }else{
            return Utility.returnSuccess(['Invalid passphrase']);
          }
            //  return $http({
            //     method: 'GET',
            //     url: baseUrl+'getseed/?token='+token+'&account_id='+account_id,
            //     headers: { 'Authorization': 'JWT '+token },

            // });
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

    return self;

});
