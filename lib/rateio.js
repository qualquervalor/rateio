(function() {

  var rateio = {};

  var oxr = require('open-exchange-rates');

  rateio.setOXR_ID = function(opts) {
    oxr.app_id = opts.app_id;
    return oxr;
  }

  // This value will be used to determine wether we should grab the data from
  //our local static file or talk to an api to get the information
  rateio.fromLocal = true;

  //File to store the currency rates
  rateio.localFile = __dirname +"/rates.txt";

  //These are various symbols for different currencies.
  //pulled from https://github.com/carolineschnapp/currencies/blob/master/jquery.currencies.js
  var symbols = {
    "USD": "$",
    "EUR": "&euro;",
    "GBP": "&pound;",
    "CAD": "$",
    "ARS": "$",
    "AUD": "$",
    "BBD": "$",
    "BDT": "Tk ",
    "BSD": "BS$",
    "BHD": "0 BHD",
    "BRL": "R$ ",
    "BOB": "Bs",
    "BND": "$",
    "BGN": "лв",
    "MMK": "K",
    "KYD": "$",
    "CLP": "$",
    "CNY": "&#165;",
    "COP": "$",
    "CRC": "&#8353;",
    "HRK": "kn",
    "CZK": "K&#269;",
    "DKK": "",
    "DOP": "RD$",
    "XCD": "$",
    "EGP": "LE",
    "XPF": "XPF",
    "FJD": "$",
    "GHS": "GH&#8373;",
    "GTQ": "",
    "GYD": "$",
    "GEL": "GEL",
    "HKD": "$",
    "HUF": "",
    "ISK": "kr",
    "INR": "₹",
    "IDR": "",
    "NIS": "NIS",
    "JMD": "$",
    "JPY": "&#165;",
    "JOD": "0 JD",
    "KZT": "KZT",
    "KES": "KSh",
    "KWD": "0 KD",
    "LVL": "Ls",
    "LTL": "Lt",
    "MXN": "$",
    "MYR": "RM MYR",
    "MUR": "Rs",
    "MDL": "MDL",
    "MAD": "dh",
    "MNT": "&#8366",
    "MZN": "Mt",
    "ANG": "&fnof;",
    "NZD": "$",
    "NGN": "&#8358;",
    "NOK": "kr",
    "OMR": "OMR",
    "PKR": "Rs.",
    "PYG": "Gs.",
    "PEN": "S/.",
    "PHP": "&#8369;",
    "PLN": "zl",
    "QAR": "QAR",
    "RON": "lei",
    "RUB": "&#1088;&#1091;&#1073;",
    "SAR": "SR",
    "RSD": "RSD",
    "SCR": "Rs",
    "SGD": "$",
    "SYP": "S&pound;",
    "ZAR": "R",
    "KRW": "&#8361;",
    "LKR": "Rs",
    "SEK": "kr",
    "CHF": "SFr.",
    "TWD": "$",
    "THB": "&#xe3f;",
    "TZS": "TZS",
    "TTD": "$",
    "TRY": "TL",
    "UAH": "₴",
    "AED": "Dhs.",
    "UYU": "$",
    "VEB": "Bs.",
    "VND": "₫",
    "ZMK": "K",
    "XBT": "BTC"
  };

  //This method will return the appropriate symbol for the currency if we know about it,
  //otherwise it will return an empty string.
  rateio.getSymbol = function (currency_code,callback)
  {
    var found_symbol = symbols[currency_code];
    if (!found_symbol){
      found_symbol=""
    }
    callback(found_symbol);

   return rateio;
  }

  //This method will get the exchange rate for the requested currency_code.  Depending on
  //whether the variable fromLocal is set will either grab the value using an external
  //source or a local static copy of the data 
  rateio.getRate = function(currency_code, callback){
    var rateFound = false;

    if (!rateio.fromLocal)
    {
      oxr.latest(function(error) {
        if ( error ) {
            // `error` will contain debug info if something went wrong:
            console.log( 'ERROR loading rates from API! Error was:' )
            console.log( error.toString() );
            // You could use hard-coded rates if error 
        }
        else{
          var current = oxr.rates[currency_code];
          if (current != "undefined")
          {
            //we need to update the local file, but we dont have to wait for the result
            rateio.getSymbol(currency_code,function(symbol){
              rateio.updateRate(currency_code,symbol,current,function(){
                callback(current);
              });
            });
            
            rateFound = true;
          }
        }

        if (!rateFound){
          callback(null);
        }
      });
    }
    else{
      lineReader = require('line-reader').open(rateio.localFile, function(reader) {
        while (reader.hasNextLine()) {
          reader.nextLine(function(line) {
              var index_of_equals = line.search(/=/);
              last_index_of_space = line.lastIndexOf(" "),
                  code_part   = line.substring(0,index_of_equals),
                  symbol_part = line.substring(index_of_equals+1,last_index_of_space),
                  rate_part   = line.substring(last_index_of_space+1);
            if (code_part === currency_code)
            {
              callback(rate_part);
              rateFound = true;
            }
          });
        }
        if (!rateFound){
          callback(null);
        }
      });
    }
    return rateio;
  }

  //This method updated the local static copy of the exchange rate with the passed
  //in values.
  rateio.updateRate = function(currency_code,symbol,rate,callback){
    var fs = require("fs");
    fs.readFile(rateio.localFile, 'utf8', function (err,data) {
      if (err) {
        console.log(err);
        callback();
        return rateio;
      }
      
      var replacement = currency_code+"="+symbol+" "+rate;
      var myExp = new RegExp(currency_code+".*", 'g');
      var result = data.replace(myExp, replacement);
      //Check to see if a replacement was made, so we know whether we 
      //need to append new data to the end of the file.
      if (result === data)
      {
        replacement = "\n"+replacement;
        fs.appendFile(rateio.localFile, replacement, function (err) {
          if (err) {
            console.log(err);
          }
          callback();
          return rateio;
        });
      }
      else
      {
        fs.writeFile(rateio.localFile, result, 'utf8', function (err) {
          if (err) {
            console.log(err);
          }
          callback();
          return rateio;
        });
      }
    });
    return rateio;
  }

  // Export the library module:
  module.exports = rateio;

}())