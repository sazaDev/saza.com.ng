
(function() {
  var Config = {

"Stellar" : {
    "testNetwork": "https://horizon-testnet.stellar.org",
    "liveNetwork": "https://horizon.stellar.org",
    "homeDomain": "saza.io",
    "homeAccount": "GDWTOOMU7BTHAYGKKTCLKXHEF56DHUXHYISSAPNJ2JDRYPYHUFY3HIXH",
    "inflationDest": "GDWTOOMU7BTHAYGKKTCLKXHEF56DHUXHYISSAPNJ2JDRYPYHUFY3HIXH",
    "testHomeDomain": "saza.com.ng",
    "testHomeAccount": "GD3LJIQEWEOWKEKW7N7YX255RFJKWLVKIU457LUZPWP22I3HLR5WOCBK",
    "testInflationDest": "GD3LJIQEWEOWKEKW7N7YX255RFJKWLVKIU457LUZPWP22I3HLR5WOCBK",
    "anchorLimit": ""
  },
  "General": {
    "production": "local",
    "appEmail": "hello@saza.io",
    "date": Date.now()
  },


};

if (Config.General.production === 'local') {
  Config.General.baseUrl = "http://localhost:8888/";
  Config.General.stellarNetwork = "https://horizon-testnet.stellar.org";
}

if (Config.General.production === 'staging') {
  Config.General.baseUrl = "https://test.saza.io:8181/";
  Config.General.stellarNetwork = "https://horizon-testnet.stellar.org";
}

if (Config.General.production === 'live') {
  Config.General.baseUrl = "https://saza.io:8181/";
  Config.General.stellarNetwork = "https://horizon.stellar.org";
}

 window.Config = Config;
})();


