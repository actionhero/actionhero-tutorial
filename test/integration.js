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
          body.users.length.should.equal(2);
          body.users.indexOf("evan").should.equal(0);
          should.not.exist(body.error);
          done();
        });
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

    it("The new post should be in the list of posts", function(done){
      request.post(setup.testUrl + "/postsList", {form: {userName: "evan"}}, function(err, response, body){
        body = JSON.parse(body);
        body.posts.indexOf("test post title").should.equal(0)
        should.not.exist(body.error);
        done();
      });
    });

    it("The new post should not be in the list of posts for another user", function(done){
      request.post(setup.testUrl + "/postsList", {form: {userName: "someoneElse"}}, function(err, response, body){
        body = JSON.parse(body);
        body.posts.should.not.containEql("test post title");
        should.not.exist(body.error);
        done();
      });
    });

  });  

});