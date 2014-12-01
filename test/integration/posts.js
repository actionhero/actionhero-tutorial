var request = require("request");
var should = require("should");
var setup = require("./../_setup.js")._setup;

describe('integration', function(){  
  
  before(function(done){
    setup.init(function(){
      request.post(setup.testUrl + "/userAdd", {form: {userName: "testPoster", password: "password"}} , function(err, response, body){
        done();
      });
    });
  });

  describe('posts', function(){

    it("I can add a post", function(done){
      request.post(setup.testUrl + "/postAdd", {form: {
        userName: "testPoster", 
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
      request.post(setup.testUrl + "/postView", {form: {userName: "testPoster", password: "password", title: "test post title"}} , function(err, response, body){
        body = JSON.parse(body);
        body.post.title.should.equal("test post title")
        body.post.content.should.equal("post content")
        should.not.exist(body.error);
        done();
      });
    });

    it("The new post should be in the list of posts", function(done){
      request.post(setup.testUrl + "/postsList", {form: {userName: "testPoster"}}, function(err, response, body){
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