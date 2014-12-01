var request = require("request");
var should = require("should");
var setup = require("./../_setup.js")._setup;

describe('integration', function(){  
  
  before(function(done){
    setup.init(done);
  });

  describe('users', function(){

    it("I can create a user", function(done){
      request.post(setup.testUrl + "/userAdd", {form: {userName: "evan", password: "password"}} , function(err, response, body){
        body = JSON.parse(body);
        should.not.exist(body.error);
        done();
      });
    });

    it("Creating a dupliate user will fail", function(done){
      request.post(setup.testUrl + "/userAdd", {form: {userName: "evan", password: "password"}} , function(err, response, body){
        body = JSON.parse(body);
        body.error.should.equal('userName already exists');
        done();
      });
    });

    it("I can log in", function(done){
      request.post(setup.testUrl + "/authenticate", {form: {userName: "evan", password: "password"}} , function(err, response, body){
        body = JSON.parse(body);
        body.authenticated.should.equal(true);
        should.not.exist(body.error);
        done();
      });
    });

    it("The wrong password will prevent logging in", function(done){
      request.post(setup.testUrl + "/authenticate", {form: {userName: "evan", password: "xxx"}} , function(err, response, body){
        body = JSON.parse(body);
        body.authenticated.should.equal(false);
        body.error.should.equal('unable to log in');
        done();
      });
    });

    it("I should be in the list of users", function(done){
      request.post(setup.testUrl + "/userAdd", {form: {userName: "someoneElse", password: "password"}} , function(err, response, body){
        should.not.exist(body.error);
        request.get(setup.testUrl + "/usersList", function(err, response, body){
          body = JSON.parse(body);
          body.users.length.should.greaterThan(1);
          body.users.indexOf("evan").should.equal(0);
          should.not.exist(body.error);
          done();
        });
      });
    });

  }); 

});