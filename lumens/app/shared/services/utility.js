// var StellarSDK = require('stellar-sdk');
// var jwt         = require('jsonwebtoken');
// var Brick = require('../bricks/brick.model');
// var config = require('config');
// // var encryptor = require('simple-encryptor')(config.get('Encrypt.secret'));
// var encryptor = require('simple-encryptor');

var Forge = forge;
var bcrypt = dcodeIO.bcrypt;

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
  decrypt: function() {},
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

};
 window.Utility = Utility;
})();


