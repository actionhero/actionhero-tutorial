var request = require("request");
var should = require("should");
var setup = require("./../_setup.js")._setup;

describe('integration', function(){  
  
  before(function(done){
    setup.init(done);
  });

  it("the api should work in general", function(done){
    request.get(setup.testUrl + "/someAction", function(err, response, body){
      body = JSON.parse(body);
      body.error.should.equal("unknown action or invalid apiVersion");
      done();
    });
  });

});