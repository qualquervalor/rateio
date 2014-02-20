var rateio = require('../lib/rateio.js'),
    assert = require('assert'),
    sinon = require("sinon"),
    testFilePath = __dirname + '/test_rates.txt';

//This variable has to be set to access external open exchange rate values.
//Two test will fail, if this is not set.
rateio.setOXR_ID({ app_id:  process.env.OXR_ID });


describe("RateIO", function(){
  describe("getSymbol", function(){
    it("should return the correct symbol when it exist", function(done) {
      var code ='CAD';
      var expected = "$";
      rateio.getSymbol(code,function(data){
        assert.equal(expected, data, 'The symbol returned for CAD should be $');
        done();
      });      
    });
    it("should return the empty string when symbol not present", function(done) {
      var code ='banana';
      var expected = "";
      rateio.getSymbol(code,function(data){
        assert.equal(expected, data, 'The symbol returned for banana should be ""');
        done();
      });      
    });
  });

  describe("getRate", function(){
    describe("when rateio.fromLocal = true",function(){
      beforeEach(function(){
        rateio.fromLocal = true;
        rateio.localFile = testFilePath;
      });
      it("should return the correct rate from the local file",function(done){
        var code ='CNY';
        var expected = "6.05";
        rateio.getRate(code,function(data){
          assert.equal(data, expected, 'The rate returned for CNY should be 6.05');
          done();         
        });
      });
      it("should return null when the rate data is not in the local file",function(done){
        var code ='banana';
        var expected = null;
        rateio.getRate(code,function(data){
          assert.equal(data, expected, 'The rate returned for banana should be NULL');
          done();
        });      
      });
    });

    describe("when rateio.fromLocal = false",function(){
      var fs = require("fs");
      var original = "";
      beforeEach(function(done){
        rateio.fromLocal = false;
        rateio.localFile = testFilePath;
        fs.readFile(rateio.localFile,'utf8', function(err, data) {
          if (err) {
            console.log(err);
          }
          original = data;
          done();
        });    
      });
      afterEach(function(done){
        //restore original
        rateio.localFile = testFilePath;
        fs.writeFile(rateio.localFile, original, 'utf8', function (err) {
          if (err) {
            console.log(err);
          }
          done();
        });    
      });
      //not sure how to stub out the external calls
      it("should return a rate from the the OXR API",function(done){
        var code ='CNY';
        rateio.getRate(code,function(data){
          assert.ok(data, 'The rate returned for CNY should be not null: '+data);
          done();         
        });
      });
      it("should return null when the rate data is not available from the OXR API",function(done){
        var code ='banana';
        rateio.getRate(code,function(data){
          assert.ok(!data, 'The rate returned for banana should be null: '+data);
          done();         
        });
      });
     });
  });

  describe("updateRate", function(){
    var fs = require("fs");
    var original = "";
    beforeEach(function(){
      rateio.fromLocal = true;
      rateio.localFile = testFilePath;
      fs.readFile(rateio.localFile, function(err, data) {
        if (err) {
          console.log(err);
        }
        original = data;
      });    
    });
    afterEach(function(){
      //restore original
      rateio.localFile = testFilePath;
      fs.writeFile(rateio.localFile, original, 'utf8', function (err) {
        if (err) {
          console.log(err);
        }
      });
    });
    it("should update value in the local file when it exist", function(done){
      var code = "CAD",
        symbol = "$",
        rate = "1.11";

      rateio.updateRate(code,symbol,rate,function(){
        rateio.getRate(code,function(data){
          assert.equal(data, rate, 'The rate for CAD was updated to 1.11');
          done();
        })
      });   
    });
    it("should append value in the local file when it does not exist", function(done){
      var code = "CD",
        symbol = "$*",
        rate = 9.9;

      rateio.updateRate(code,symbol,rate,function(){
        rateio.getRate(code,function(data){
          assert.equal(data, rate, 'The rate for CD was set to 9.9');
          done();
        })
      });  
    });
  });
});
 