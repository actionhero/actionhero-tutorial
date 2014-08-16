var request = require("request");
var should = require("should");
var setup = require("./_setup.js")._setup;

describe('integration', function(){  
  
  before(function(done){
    setup.init(done);
  });

  it("the api should work in general", function(done){
    request.get(setup.testUrl + "/someAction", function(err, response, body){
      body = JSON.parse(body);
      body.error.should.equal("Error: unknown action or invalid apiVersion");
      done();
    });
  });

  describe('creating a user', function(){

    it("I can create a user", function(done){
      request.post(setup.testUrl + "/userAdd", {form: {userName: "evan", password: "password"}} , function(err, response, body){
        body = JSON.parse(body);
        should.not.exist(body.error);
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

    it("I should be in the list of users", function(done){
      request.get(setup.testUrl + "/usersList", function(err, response, body){
        body = JSON.parse(body);
        body.users.should.include("evan")
        should.not.exist(body.error);
        done();
      });
    });

  });

  describe('creating a post', function(){

    it("I can add a post", function(done){
      request.post(setup.testUrl + "/postAdd", {form: {
        userName: "evan", 
        password: "password", 
        title: "test post title", 
        content: "post content"
      }} , function(err, response, body){
        body = JSON.parse(body);
        should.not.exist(body.error);
        done();
      });
    });

    it("I can view a post", function(done){
      request.post(setup.testUrl + "/postView", {form: {userName: "evan", password: "password", title: "test post title"}} , function(err, response, body){
        body = JSON.parse(body);
        body.post.title.should.equal("test post title")
        body.post.content.should.equal("post content")
        should.not.exist(body.error);
        done();
      });
    });

    it("I should be in the list of posts", function(done){
      request.post(setup.testUrl + "/postsList", {form: {userName: "evan"}}, function(err, response, body){
        body = JSON.parse(body);
        body.posts.should.include("test post title")
        should.not.exist(body.error);
        done();
      });
    });

  });  

});