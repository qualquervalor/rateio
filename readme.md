Rate IO
===========

Asynchronous utility to help with exchange rates.

Requires 
--------
'fs'
'line-reader'
'open-exchange-rates'

Usage
-----

To start using it you will need an api-id for open-exchange-rates.  

  var rateio = require('rateio');
  rateio.setOXR_ID({ app_id: 'YOUR_APP_ID' })

This library includes three main methods:

1. rateio.getSymbol(currency_code, callback)

  -currency_code is expeced to be a string corresponding to ISO 4217 code for a particular countries currency

  The library maintains a mapping of ISO 4217 to symbols.  If there is a mapping for the given value, the appropriate symbol will be returned.  If no mapping exist, an empty string will be returned.

2. rateio.updateRate(currency_code,currency_symbol,rate,callback)

  -currency_code is expeced to be a string corresponding to ISO 4217 code for a particular countries currency
  -currency_symbol is a symbol representing a currency
  -rate is the current exchange rate for this currency based on the US dollar.

  This method is used to update a local static file that holds currency information in the following format: CODE=SYMBOL RATE
  USD=$ 1
  EUR=€ 0.74
  CAD=$ 1.10

3. rateio.getRate(currency_code,callback)

  -currency_code is expeced to be a string corresponding to ISO 4217 code for a particular countries currency

  This method will get the exchange rate for the requested currency_code.  Depending on
  whether the variable fromLocal is set will either grab the value using an external
  source or a local static copy of the data.

  The boolean value 
    -rateio.fromLocal 
  is true by default.  If this value is false the getRate method will attemp to grab the data through the open-exchange-rate API.  