// var StellarSDK = require('stellar-sdk');
// var jwt         = require('jsonwebtoken');
// var Brick = require('../bricks/brick.model');
// var config = require('config');
// // var encryptor = require('simple-encryptor')(config.get('Encrypt.secret'));
// var encryptor = require('simple-encryptor');

var Forge = forge;
var bcrypt = dcodeIO.bcrypt;
var StellarSDK = StellarSdk;

(function() {
  var Utility = {
  encrypt: function(password, plainText) {
    var numIteration = 4096;
    var salt = Forge.random.getBytesSync(128);
    var key = Forge.pkcs5.pbkdf2(password, salt, numIteration, 16);
    var iv = Forge.random.getBytesSync(16);
    var cipher = Forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(Forge.util.createBuffer(plainText));
    cipher.finish();
    var cipherText = Forge.util.encode64(cipher.output.getBytes());
    var rtnObj = {
        text: cipherText,
        salt: Forge.util.encode64(salt),
        iv:  Forge.util.encode64(iv)
    };

    return rtnObj;
  },

  decrypt: function(cipherObj, password) {
    console.log("cipherObj", cipherObj);
    console.log("password", password);
    var numIteration = 4096;
    var salt = Forge.util.decode64(cipherObj.salt);
    var iv = Forge.util.decode64(cipherObj.iv);
    var key = Forge.pkcs5.pbkdf2(password, salt, numIteration, 16);
    var decipher = Forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(Forge.util.createBuffer(Forge.util.decode64(cipherObj.text)));
    decipher.finish();
    var decipheredText = decipher.output.toString();

    return decipheredText;
  },

  getSeedObj: function(id, accounts) {
    var seedObj = "";
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].account_id == id) {
        seedObj = {"text": accounts[i].skey,
                    "salt": accounts[i].salt,
                    "iv": accounts[i].iv
                  };
      }

    }
    return seedObj;
  },

  getHash: function(text) {
    var hashString = bcrypt.hashSync(text, bcrypt.genSaltSync(8), null);
    console.log("hashString: ", hashString);
    return hashString;
  },
  validatePassphrase: function(passphrase, storedPassphrase) {

    try{
      var val = bcrypt.compareSync(passphrase, storedPassphrase);
      return val;
    }
    catch(error){
      console.log(error);
      return false;
    }
  },

  returnError: function(messages) {
    return new Promise(function(resolve, reject) {
                    var errObj = {  status: false,
                                    content: {
                                        message: messages
                                    }
                                  };
                    reject(errObj);
                });
  },

  returnSuccess: function(messages) {
    return new Promise(function(resolve, reject) {
                    var successObj = {status: true,
                                      content: {
                                        message: messages
                                      }
                                    };
                    resolve(successObj);
                });
  },

  validateSeed: function (seed) {
    var tempKeyPair = false;

    try{
      tempKeyPair = StellarSDK.Keypair.fromSecret(seed);

    }
    catch(error){
      console.log("Unable to generate keyPair");
      return false;

    }

    if (tempKeyPair) {
      return tempKeyPair;
    }
      return false;
  },
  extractError: function(error) {
    var rtnError = [];
    if (error.title) {
      rtnError.push(error.title);
    }

    if (error.code) {
      rtnError.push(error.code);
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
        rtnError.push(" Network Error. Please Try again");
      }
    }

    if (error.extras) {
      if(error.extras.result_codes){
        if (error.extras.result_codes.transaction) {
          rtnError.push("Transaction Error: "+error.extras.result_codes.transaction);
        }

        if (error.extras.result_codes.operations) {
          error.extras.result_codes.operations.forEach(function(ops) {
            rtnError.push("Operation Error: "+ops);
          });
        }

      }
    }

    if(error.data){
      if (error.data.content) {
        error.data.content.message.forEach(function(ops) {
            rtnError.push(ops);
          });
      }
    }

    return rtnError;
  },
  generateAsset: function(type,code,issuer) {
    if (type === 'undefined') {
      return false;
    }

    if (code === 'undefined') {
      code = "";
    }

    if (issuer === 'undefined') {
      issuer = "";
    }

    if (type == 0) {
      return StellarSDK.Asset.native();
    }else{
      var asset = "";
      try{
        asset =  new StellarSDK.Asset(code, issuer);
        return asset;
      }
      catch(error){
        return false;
      }

    }
  },
  isEmpty: function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  },
  validatePaymentInput: function (destAcct, amount, memoText) {
    try{
      // check its a stellar address or account ID

      if (destAcct.indexOf('*') < 0) {
        // not stellar address
        if (!StellarSDK.StrKey.isValidEd25519PublicKey(destAcct)) {
          return {status: false, content: {message: ['Invalid Destination Address']}};
        }
      }else{
        // stellar address
      }




      if (memoText.length > 28) {
        return {status: false, content: {message: ['memo can only have 28 characters']}};
      }

      if (isNaN(amount)) {
        return {status: false, content: {message: ['Please enter a valid amount']}};
      }

      return {status: true, content: {message: ['Input Validation successful']}};
    }
    catch(error){
      // To Do
      console.error("validatePaymentInput Error", error);
      return {status: false, content: {message: ['Input Validation failed']}};

    }
  },
  randomString: function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },


};
 window.Utility = Utility;
})();


