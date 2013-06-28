# actionHero Tutorial

<img src="https://raw.github.com/evantahler/actionHero/master/public/logo/actionHero.png" height="300"/>

- created: June 22, 2013
- updated: June 22, 2013

---

This guide will walk you through the creation of this application, and in the process you will learn some of the basics of actionHero.

You will become comfortable with the following topics:

**A simple Blogging API & site:**

- [Getting Started with a new actionHero Project](#getting-started-with-a-new-actionhero-project)
- [Creating Initializers](#creating-initializers)
- [Users & Authentication](#users--authentication)
- [Public and Private actions with Middleware](#public-and-private-actions-with-middleware)
- [Creating Actions](#creating-actions)
- [Routes](#routes)
- [Testing](#testing)
- [Consuming the API via the Web](#consuming-the-api-via-the-web)

**Adding a chat room**

- [Sockets](#scokets)
- [Websockets](#websockets)
- [Tasks](#tasks)

**Creating a Custom Server**

- [Custom Server](#custom-server)

**Next Steps**

- [Notes](#notes)
- [Next Steps / TODO](#next-steps--todo)

## Notes

- The code in this repository represents the final state of a project created with these instructions.  The code in this project should server as a reference.  **You do not need to check out this repository to follow this guide**
- It is assumed that you have basic familiarity with node.js and the command line.
- This project uses redis as a database.  actionHero comes with 'fakeRedis', which is an in-process redis server, but it does not persist data.  If you want to use this process in a cluster or across multiple servers, you need to install and use a real redis server.  Change the appropriate `redis` sections in `config.js` to enable this.
- Remember that actionHero is an API server, not an website framework.  We will be focusing on creating an API for bogging, and *applying* that to a website rather than creating a beautiful website. 

## Getting Started with a new actionHero Project

actionHero is a node.js package.  Be sure you have node.js (a version > 8.0.0) installed.  Node now also comes with npm, the node package manager.  You can get node from [nodejs.org](http://nodejs.org/)

This guide is written on OSX 10.8  It should be appropriate for any version of OSX > 10.6.  It should also work on most Linux distributions (Ubuntu, CentOs).  The concepts presented here should also be appropriate for windows users, but many of the "Getting Started" commands will need to be modified.  

Create a new directory for this project and enter it (in the terminal): 

- `mkdir ~/actionHero-tutorial`
- `cd ~/actionHero-tutorial`

**note:** From this point forward, it is assumed that all commands listed are run from within the `~/actionHero-tutorial` directory.

Install the actionHero package locally from NPM:

- `npm install actionHero`

Use the actionHero generator to build your project

- `./node_modules/.bin/actionHero generate`

Try to boot the actionHero server

- `npm start` 

You should see the default actionHero welcome page at `http://localhost:8080/public`

The port `8080` is defined in `config.js`, along with all other settings for actionHero.  actionHero has 2 types of http routes: static files and apis.  static files are served from `/public` and the api is served from `/api`.  These routes are configurable.  actionHero also picks one of these to be the default root route.  This is defined by `configData.servers.web.rootEndpointType`.  As we want to make a website, lets change that from `api` to `file`.

Restart your server by pressing `ctrl+c` in the terminal window running actionHero.  Now visit `http://localhost:8080/` and you should see the welcome page.  You will note that the setting we just changed was under the `servers.web` section.  This is because this setting is only relevant to HTTP clients, and not the others (socket, websocket, etc).  We will talk about these more later.

We should also enable all the servers which ship with actionHero (web, websocket, and socket).  Uncomment `thier` sections in `config.js`

Lets change one more thing in `config.js`: development mode.  Change `configData.general.developmentMode = true;`  Development mode is helpful while creating a new application as it will automatically restart your server on config changes, and watch and reload your actions and tasks as you change them.  Keep in mind that you will still need to manually restart your server if you make any changes to your initializers. 

## Creating Initializers

initializers in actionHero are places to save common code which other parts of your application will use.  Here is where you might connect to your database or define middleware.  Normally, you append your new classes to the `api` object so it becomes available in scope for your actions and tasks (like `api.mysql` or `api.game`).

Because we are building a blog, first we will need a place to store our entries and comments.  As actionHero already has redis available under `api.redis.client`, lets use that.

Create a new initializer for the blog's common functions:

- `node ./node_modules/.bin/actionHero generateInitializer --name=blog`

I'll define some common blog functions we'll use later in actions:

```javascript
// initializers/blog.js

exports.blog = function(api, next){
  var redis = api.redis.client;
  api.blog = {

    // constants

    seperator: ";",
    postPrefix: "posts",
    commentPrefix: "comments:",

    // posts
    
    postAdd: function(userName, title, content, next){
      var key = this.buildTitleKey(userName, title);
      var data = {
        content: content,
        title: title,
        userName: userName,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }
      redis.hmset(key, data, function(error){
        next(error)
      });
    },

    postView: function(userName, title, next){
      var key = this.buildTitleKey(userName, title);
      redis.hgetall(key, function(error, data){
        next(error, data);
      });
    },

    postsList: function(userName, next){
      var self = this;
      var search = self.postPrefix + self.seperator + userName + self.seperator;
      redis.keys(search+"*", function(error, keys){
        var titles = [];
        var started = 0;
        keys.forEach(function(key){
          var parts = key.split(self.seperator)
          var k = parts[(parts.length - 1)];
          titles.push(k);
        });
        titles.sort();
        next(error, titles)
      });
    },
    
    postEdit: function(userName, title, content, next){
      var key = this.buildTitleKey(userName, title);
      this.viewPost(key, function(error, data){
        var newData = {
          content: content,
          title: title,
          userName: userName,
          createdAt: data.createdAt,
          updatedAt: new Date().getTime(),
        }
        redis.hmset(key, newData, function(error){
          next(error)
        });
      });
    },
    
    postDelete: function(userName, title, next){
      var self = this;
      var key = self.buildTitleKey(userName, title);
      redis.del(key, function(error){
        if(error){
          next(error);
        }else{
          var commentKey = self.buildCommentKey(userName, title);
          redis.del(commentKey, function(error){
            next(error);
          });
        }
      });
    },

    // comments

    commentAdd: function(userName, title, commenterName, comment, next){
      var key = this.buildCommentKey(userName, title);
      var commentId = this.buildCommentId(commenterName);
      var data = {
        comment: comment,
        createdAt: new Date().getTime(),
        commentId: commentId
      }
      redis.hset(key, commentId, JSON.stringify(data), function(error){
        next(error);
      })
    }, 

    commentsView: function(userName, title, next){
      var key = this.buildCommentKey(userName, title);
      redis.hgetall(key, function(error, data){
        var comments = [];
        for(var i in data){
          comments.push( JSON.parse( data[i] ) );
        }
        next(error, comments);
      })
    },
    
    commentDelete: function(userName, title, commentId, next){
      var key = this.buildCommentKey(userName, title);
      redis.hdel(key, commentId, function(error){
        next(error);
      })
    },

    // helpers

    buildTitleKey: function(userName, title){
      return this.postPrefix + this.seperator + userName + this.seperator + title // "posts:evan:my first post"
    },
    buildCommentKey: function(userName, title){
      return this.commentPrefix + this.seperator + userName + this.seperator + title // "comments:evan:my first post"
    },
    buildCommentId: function(commenterName){
      return commenterName + new Date().getTime();
    }

  }

  next();
}

```

A few things to note:
- posts are hashes with the content and some additional meta data
- comments are also hashes, a key for each comment
- we always make asynchronous functions, and they always return `callback(error, data)`, a common node.js pattern.
- at this layer, we don't worry about authentication or validations

## Users & Authentication 

We know we will need to authenticate users to our blog, so lets make another initializer to handle this as well.

Lets install the `bcrypt` module for good password hashing

`npm install bcrypt`

and add it to our `package.json` as a dependency.

- `node ./node_modules/.bin/actionHero generateInitializer --name=users`

```javascript
// initializers/users.js
var bcrypt = require('bcrypt');

exports.users = function(api, next){
  var redis = api.redis.client;
  api.users = {

    // constants
    usersHash: "users",

    // methods

    add: function(userName, password, next){
      var self = this;
      redis.hget(self.usersHash, userName, function(error, data){
        if(error != null){
          next(error);
        }else if(data != null){
          next("userName already exists");
        }else{
          self.cryptPassword(password, function(error, hashedPassword){
            if(error != null){
              next(error);
            }else{
              var data = {
                userName: userName,
                hashedPassword: hashedPassword,
                createdAt: new Date().getTime(),
              }
              redis.hset(self.usersHash, userName, JSON.stringify(data), function(error){
                next(error);
              });
            }
          });
        }
      });
    },

    list: function(next){
      var self = this;
      redis.hgetall(self.usersHash, function(error, users){
        var userData = [];
        for(var i in users){
          userData.push( JSON.parse( users[i] ) );
        }
        next(error, userData);
      });
    },

    authenticate: function(userName, password, next){
      var self = this;
      redis.hget(self.usersHash, userName, function(error, data){
        if(error != null){
          next(error);
        }else{
          data = JSON.parse(data);
          self.comparePassword(data.hashedPassword, password, function(error, match){
            next(error, match);
          });
        }
      });
    },

    delete: function(userName, password, next){
      var self = this;
      redis.del(self.usersHash, userName, function(error){
        api.blog.listUserPosts(userName, function(error, titles){
          if(titles.length == 0 || error != null){
            next(error);
          }else{
            var started = 0;
            titles.forEach(function(title){
              started++;
              api.blog.deletePost(userName, title, function(error){
                started--;
                if(started == 0){
                  next();
                }
              });
            });
          }
        });
      });
    },

    // helpers

    cryptPassword: function(password, next) {
       bcrypt.genSalt(10, function(error, salt) {
        if (error){
          return next(error)
        }else{
          bcrypt.hash(password, salt, function(error, hashedPassword) {
              return next(error, hashedPassword);
          });
        }
      });
    },

    comparePassword: function(hashedPassword, userPassword, next) {
       bcrypt.compare(userPassword, hashedPassword, function(error, match){
          return next(error, match);
       });
    },
  }

  next();
}

```

Notes:
- We are again storing all data in a redis hash 
- If we delete a user, we should delete all the posts and comments from them

## Public and Private actions with Middleware

In the steps above, we created a `api.users.authenticate` method, but didn't user it anywhere.  There are clearly methods which should be protected (like adding a post, or deleting a user), but we need to safeguard them somehow.  

In actionHero, we know that we will wrap our initializer's methods in actions, so we can create a middleware which we can later apply to actions.  

Let's create a new initializer for this:

- `node ./node_modules/.bin/actionHero generateInitializer --name=middleware`

There are arrays of functions in actionHero which will be run before an after every action.  Here, we only need a check before to see if an action should be run.  You have access to the action itself, along with the connection.  

The middleware we created allows us to simply append `action.authenticated = true` to the action, and the middleware will be invoked.

```javascript
exports.middleware = function(api, next){

  var authenticationMiddleware = function(connection, actionTemplate, next){
    if(actionTemplate.authenticated === true){
      api.users.authenticate(connection.params.userName, connection.params.password, function(error, match){
        if(match === true){
          next(connection, true);
        }else{
          connection.error = "Authentication Failed.  userName and password required";
          next(connection, false);
        }
      });
    }else{
      next(connection, true);
    }
  }

  api.actions.preProcessors.push(authenticationMiddleware);

  next();
}

```

## Creating Actions

Now that we have our helpers for getting and setting blog posts, how can we allow users to use them?  Actions!

Action files can define a few actions each, so lets create one for comments and one for posts.

- `./node_modules/.bin/actionHero generateAction --name=users`
- `./node_modules/.bin/actionHero generateAction --name=blog`

And here are our actions:

```javascript
exports.userAdd = {
  name: "userAdd",
  description: "I add a user",
  inputs: {
    required: ["userName", "password"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.users.add(connection.params.userName, connection.params.password, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.userDelete = {
  name: "userDelete",
  description: "I delete a user",
  inputs: {
    required: ["userName", "password"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.users.delete(connection.params.userName, connection.params.password, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.usersList = {
  name: "usersList",
  description: "I list all the users",
  inputs: {
    required: [],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.users.list(function(error, users){
      connection.error = error;
      connection.response.users = [];
      for(var i in users){
        connection.response.users.push(users[i].userName)
      }
      next(connection, true);
    });
  }
};

exports.authenticate = {
  name: "authenticate",
  description: "I authenticate a user",
  inputs: {
    required: ["userName", "password"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.users.authenticate(connection.params.userName, connection.params.password, function(error, match){
      connection.error = error;
      connection.response.authenticated = match;
      next(connection, true);
    });
  }
};

```

```javascript
exports.postAdd = {
  name: "postAdd",
  description: "I add a post",
  inputs: {
    required: ["userName", "password", "title", "content"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postAdd(connection.params.userName, connection.params.title, connection.params.content, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.postView = {
  name: "postView",
  description: "I view a post",
  inputs: {
    required: ["userName", "title"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postView(connection.params.userName, connection.params.title, function(error, post){
      connection.error = error;
      connection.response.post = post;
      next(connection, true);
    });
  }
};

exports.postsList = {
  name: "postsList",
  description: "I list all of a user's posts",
  inputs: {
    required: ["userName"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postsList(connection.params.userName, function(error, posts){
      connection.error = error;
      connection.response.posts = posts;
      next(connection, true);
    });
  }
};

exports.postEdit = {
  name: "postEdit",
  description: "I edit a post",
  inputs: {
    required: ["userName", "password", "title", "content"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postEdit(connection.params.userName, connection.params.title, connection.params.content, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.postDelete = {
  name: "postDelete",
  description: "I delete a post",
  inputs: {
    required: ["userName", "password", "title"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postDelete(connection.params.userName, connection.params.title, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.commentAdd = {
  name: "commentAdd",
  description: "I add a comment",
  inputs: {
    required: ["userName", "title", "commenterName", "comment"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.commentAdd(connection.params.userName, connection.params.title, connection.params.commenterName, connection.params.comment, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.commentsView = {
  name: "commentsView",
  description: "I show all comments for a post",
  inputs: {
    required: ["userName", "title"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.commentsView(connection.params.userName, connection.params.title, function(error, comments){
      connection.error = error;
      connection.response.comments = comments;
      next(connection, true);
    });
  }
};

exports.commentDelete = {
  name: "commentDelete",
  description: "I add a comment",
  inputs: {
    required: ["userName", "password", "commentId", "title"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.commentDelete(connection.params.userName, connection.params.title, connection.params.commentId, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};
```

Note how we added `action.authenticated = true` on the actions which required security.   

Now we can use CURL to test out our API!  Note that right now, all HTTP methods will work (get, post, etc).  We'll be setting up routing next.  Be sure to URL-encode all your input.

- Add a user: `curl -X POST -d "userName=evan" -d "password=password" "http://localhost:8080/api/userAdd"`
- Check that you can log in: `curl -X POST -d "userName=evan" -d "password=password" "http://localhost:8080/api/authenticate"`
- Add a post: `curl -X POST -d "userName=evan" -d "password=password" -d "title=first-post" -d "content=My%20first%20post.%20%20Yay." "http://localhost:8080/api/postAdd"`
- View the post `curl -X POST -d "userName=evan" -d "title=first-post" "http://localhost:8080/api/postView"`
- Add a comment `curl -X POST -d "userName=evan" -d "title=first-post" -d "comment=cool%20post" -d "commenterName=someoneElse" "http://localhost:8080/api/commentAdd"`
- View the comments `curl -X POST -d "userName=evan" -d "title=first-post" "http://localhost:8080/api/commentsView"`

## Routes

Now that we have the basics of our API working, lets setup routes.  Routes allow different HTTP verbs to preform a different action on the same URL.  We'll create a `routes.js` file to transform our API into restful resources for users, comments, and posts.  You can derive input variables from the structure of URLs with routing as well.

```javascript
exports.routes = {
  
  get: [
    { path: "/users", action: "usersList" },  
    { path: "/comments/:userName/:title", action: "commentsView" },  
    { path: "/post/:userName/:title", action: "postView" },  
    { path: "/posts/:userName/", action: "postsList" },  
  ],

  post: [
    { path: "/users", action: "userAdd" }, 
    { path: "/comments/:userName/:title", action: "commentAdd" },  
    { path: "/posts/:userName/", action: "postAdd" },  
  ],

  put: [
    { path: "/post/:userName/:title", action: "postEdit" },  
  ],

  delete: [
    { path: "/user/:userName", action: "userDelete" }, 
    { path: "/comment/:userName/:title/:commentId", action: "commentDelete" },
    { path: "/post/:userName/:title", action: "postDelete" },  
  ]

};

```
Now we can get the list of posts for user `evan` with `curl -X GET "http://localhost:8080/api/posts/evan"` and we don't need to pass any parameters. 

## Testing

There are many testing tools and packages which exist for nodejs.  actionHero is not opinionated about which testing framework you should use, but nonetheless, testing is important!  actionHero exposes a number of utilities to make it easy to boot up a server with configuration overrides to make testing easier.  

Lets setup a test with the `mocha` and `should` packages.  We'll use the `request` package to make HTTP requests simpler in our tests.

`npm install mocha should request` (and add them to your `package.json` in the `devDependencies` section).

First, lets create a spec helper in `test/_setup.js`

```javascript
exports._setup = {
  serverPrototype: require("../node_modules/actionHero/actionHero.js").actionHeroPrototype,
  testUrl:         "http://127.0.0.1:9000/api",
  
  serverConfigChanges: {
    general: {
      id: "test-server-1",
      workers: 1,
      developmentMode: false
    },
    logger: { transports: null, },
    redis: {
      fake: true,
      host: "127.0.0.1",
      port: 6379,
      password: null,
      options: null,
      DB: 0,
    },
    servers: {
      web: {
        secure: false, 
        port: 9000,    
      },
    }
  },

  init: function(callback){
    var self = this;
    if(self.server == null){
      self.server = new self.serverPrototype();
      self.server.start({configChanges: self.serverConfigChanges}, function(err, api){
        self.api = api;
        callback();
      });
    }else{
      self.server.restart(function(){
        callback();
      });
    }
  }

}
```

Now we can use our `_setup.js` in a test.  Let's create an integration test `/test/integration.js` for post creation and reading.  Note how we are using `fakeredis` so we have an isolated in-process test database to work with. 

```javascript
var request = require("request");
var should = require("should");
var setup = require("./_setup.js")._setup;

describe('integration', function(){  
  
  before(function(done){
    setup.init(done);
  });

  it("the api should work in general", function(done){
    request.get(setup.testUrl, function(err, response, body){
      body = JSON.parse(body);
      body.error.should.equal("Error: {no action} is not a known action or that is not a valid apiVersion.");
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
```

We can now run the test with the `mocha` command.  In our `package.json` we can also setup `npm test` to run the test suite how we would like it: `"test": "node ./node_modules/.bin/mocha --reporter spec ./test"`

A successfull test run looks like this:

<img src="https://raw.github.com/evantahler/actionHero-tutorial/master/images/mocha.jpg"/>

## Consuming the API via the Web

<img src="https://raw.github.com/evantahler/actionHero-tutorial/master/images/index.html.jpg"/>

actionHero is primarily an API server, but it can still serve static files for you.  In `config.js`, the `configData.general.flatFileDirectory` directive is where your web site's "root" is.  You can also use actions to manipulate file content with the `api.staticFile.get` method.  actionHero is also a great choice to power your front-end applications (angular.js, ember, etc).  The examples below are purposefully sparse and often eschew convention and best practices in favor of legibility.  No external JS (jQuery, etc) is required to use actionHero in your website.

Provided in `index.html` is a simple page which demonstrates how simple it is to call an action from the web to document the API we have created.  

## Scokets

While this application probably makes the most sense being used in a web browser, actionHero can still provide a TCP/Socket API for clients who wish to use it.   There is nothing new you need to do to enable it.  

Let's add a comment with the socket API and Telnet.  We'll make some mistakes so you can see how error responses are handled.  You will also notice how with TCP clients, params are 'sticky' by default, and you only need to set them once per session.

```bash
> telnet localhost 5000

Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.

{"welcome":"Hello! Welcome to the actionHero api","room":"defaultRoom","context":"api"}
paramAdd userName=evan
{"status":"OK","context":"response","data":null,"messageCount":1}
paramAdd title=first-post
{"status":"OK","context":"response","data":null,"messageCount":2}
paramsView
{"status":"OK","context":"response","data":{"limit":100,"offset":0,"userName":"evan","title":"first-post"},"messageCount":3}
postsList
{"posts":["first-post"],"context":"response","messageCount":4}
paramAdd comment=a-comment-from-tcp
{"status":"OK","context":"response","data":null,"messageCount":5}
commentAdd
{"error":"Error: commenterName is a required parameter for this action","context":"response","messageCount":6}
paramAdd commenterName=tcp-client
{"status":"OK","context":"response","data":null,"messageCount":7}
commentAdd
{"context":"response","messageCount":8}
commentsView
{"comments":[{"comment":"a-comment-from-tcp","createdAt":1372223802362,"commentId":"tcp-client1372223802362"}],"context":"response","messageCount":9}
exit
```

## Websockets

<img src="https://raw.github.com/evantahler/actionHero-tutorial/master/images/chat.html.jpg"/>

`/public/chat.js` demonstrates how to use actionHero's websockets.  The `websocket` is a first-class protocol in acitonHero and has all the capabilities of `web` and `socket`.  Like `socket`, it is a persistent connection which also enables actionHero's chat room features.  We will make use of them here.

Note that we include bot the JS for faye and the wrapper around it, `actionHeroWebSocket.js`

The faye transport will degrade to long-polling and finally http if those features are not available to either your clients or server.

```html
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta http-equiv="content-language" content="en" />
  <meta name="description" content="actionHero.js" />
  <link href='http://fonts.googleapis.com/css?family=Merriweather+Sans:400,700,800,300' rel='stylesheet' type='text/css'>
  <link href='/public/css/actionhero.css' rel='stylesheet' type='text/css'>
  <script type="text/javascript" src="/faye/client.js"></script>
  <script type="text/javascript" src="/public/javascript/actionHeroWebSocket.js"></script>
  <link rel="icon" href="/public/favicon.ico">
  <title>actionHero.js</title>

  <script type="text/javascript">

  var A;
  var boot = function(){
    A = new actionHeroWebSocket;
  
    A.events = {
      say: function(message){
        A.log(message);
        appendMessage(message);
      },
      alert: function(message){
        alert(message.message);
      },
      welcome: function(message){
        A.log(message);
        appendMessage(message);
      }
    }
  
    A.connect(function(err, details){
      if(err != null){
        A.log(err);
      }else{
        A.log("CONNECTED");
        document.getElementById("name").innerHTML = "<span style=\"color:#" + intToARGB(hashCode(A.id)) + "\">" + A.id + "</span>"
        A.listenToRoom("twitter")
      }
    });
      
  }

  var appendMessage = function(message){
    var s = "";
    s += "<pre>"
    if (message.welcome != null){
      s += "<div align=\"center\">*** " + message.welcome + " ***</div>";
    }else if(message.room === "twitter"){
      s += " " + formatTime(message.sentAt);
      s += " [tweet (" + message.message.twitterUser + ") #" + message.message.hashtag + "]";
      s += " " + message.message.message;
    }else{
      s += " " + formatTime(message.sentAt);
      s += "<span style=\"color:#" + intToARGB(hashCode(message.from)) + "\">"
      s += " [";
      if(message.me === true){ s += "<strong>"; }
      s += message.from;
      if(message.me === true){ s += "</strong>"; }
      s += "] ";
      s += "</span>"
      s += message.message;
    }
    s += "</pre>"
    var div = document.getElementById("chatBox")
    div.innerHTML += s;
    div.scrollTop = div.scrollHeight;
  }

  var sendMessage = function(){
    var div = document.getElementById("message");
    var message = div.value;
    div.value = "";
    A.say(message);
    appendMessage({
      me: true,
      message: message,
      from: A.id,
      sentAt: new Date().getTime(),
    })
  }

  var formatTime = function(timestamp){
    return new Date(timestamp).toLocaleTimeString()
  }

  function hashCode(str) { // java String#hashCode
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
         hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  } 

  function intToARGB(i){
      color = ((i>>24)&0xFF).toString(16) + 
             ((i>>16)&0xFF).toString(16) + 
             ((i>>8)&0xFF).toString(16) + 
             (i&0xFF).toString(16);
      return color.substring(0, 6);
  }

  </script>
  
</head>

<body onload="boot()">

  <div class="body_container">
    <div class="server_info">
      <div class="box"><div class="left">Name:</div><span id="name"></span></div>
      <div class="box"><div class="left">Message:</div>
          <input type="text" name="message" size="90" id="message"> <a href="javascript:sendMessage()">[ send ]</a>
      </div>
    </div>
  </div>

  <div class="body_container">
    <h2>Chat:</h2>
    <div class="server_info" id="actions">
      <div class="chatBox" id="chatBox">...</div>
    </div>
  </div>

</body>
</html>

```

Note how we make use of the event libraries of `actionHeroWebsocket` and build our events around that

## Tasks

actionHero comes with a robust task system for delayed / recurring tasks.  For our example, we are going to create a task which will log some stats to the command line every 30 seconds.  

`./node_modules/.bin/actionHero generateTask --name=stats`

```javascript
exports.task = {
  name: "stats",
  description: "stats",
  scope: "any",
  frequency: 30 * 1000,
  toAnnounce: true,
  run: function(api, params, next){
    var error = null;    
    var redis = api.redis.client;
    var users = [];
    var posts = [];
    var started = 0;

    var render = function(){
      api.log("*** STATUS ***");
      api.log(users.length + " users");
      api.log(posts.length + " posts");
      api.log("**************");
      next();
    }

    api.users.list(function(error, u){
      users = u;
      if(users.length == 0){
        render();
      }else{
        users.forEach(function(user){
          started++;
          api.blog.postsList(user.userName, function(error, p){
            p.forEach(function(post){
              posts.push(post);
            });
            started--;
            if(started == 0){ render(); }
          });
        });
      }
    });
  }
};

```

- note how we set the `task.frequency` to run every 30 seconds
- the scope of this task is `all`, as we want every server we might run this task on to display these stats
- `configData.general.simultaniousActions` in `config.js` defines how many tasks will be run at once per server.  You can have some instances of your application running tasks while others won't.

## Custom Server

One of the powers of actionHero is that you can build your own servers and transports.  Think of a serer as any mechanism which creates a client which may then preform an action.  This might be anything from an interface to an Arduino to a rabbitMQ client.   

We will add a server which connects to the public twitter firehouse for tweets matching "#nodejs".  We will take these tweets, and broadcast them to the chartroom we created above.

We will also use the "ntwittter" package to help us with connecting to twitter
`npm install ntwitter` (and add it to your `package.json`).  You will need to register a new twitter application at dev.twitter.com to generate the required access keys.

We created a new section in `config.js` in the `configData.servers` section to hold our twitter credentials:

```javascript
"twitter" = {
  hashtag: "tt",
  twitter: {
    consumer_key: "xxx",
    consumer_secret: "xxx",
    access_token_key: "xxx",
    access_token_secret: "xxx",
  }
}
```

- Generate a new custom server `./node_modules/.bin/actionHero generateServer --name=twitter`

```javascript
var ntwitter = require("ntwitter");

var twitter = function(api, options, next){

  //////////
  // INIT //
  //////////

  var type = "twitter"
  var attributes = {
    canChat: false,
    logConnections: true,
    logExits: true,
    sendWelcomeMessage: false,
    verbs: [],
  }

  var server = new api.genericServer(type, options, attributes);

  //////////////////////
  // REQUIRED METHODS //
  //////////////////////

  server._start = function(next){
    var self = this;
    api.twitter = new ntwitter({
      consumer_key:        api.configData.servers.twitter.consumer_key,
      consumer_secret:     api.configData.servers.twitter.consumer_secret,
      access_token_key:    api.configData.servers.twitter.access_token_key,
      access_token_secret: api.configData.servers.twitter.access_token_secret
    });

    api.twitter.verifyCredentials(function (err, data) {
      if(err == null){
        api.twitter.stream('statuses/filter', {track:'#' + api.configData.servers.twitter.hashtag}, function(stream) {
          api.twitterStram = stream;
          api.twitterStram.on('data', function (tweet) {
            self.addTweet(tweet);
          });
          next();
        });
      }else{
        api.log("Twitter Error: " + err, "error");
        next();
      }
    })
  }

  server.addTweet = function(tweet){
    try{
      var twitterUser = tweet.user.screen_name;
    }catch(e){
      var twitterUser = "unknown";
    }
    server.buildConnection({
      id: tweet.id,
      rawConnection  : { 
        hashtag: api.configData.servers.twitter.hashtag,
        clientId: tweet.id,
        message: tweet.text,
        twitterUser: twitterUser,
      }, 
      remoteAddress  : 0,
      remotePort     : 0 ,
    }); // will emit "connection"
  }

  server._teardown = function(next){
    next();
  }

  ////////////
  // EVENTS //
  ////////////

  server.on("connection", function(connection){
    connection.room = "twitter";
    api.chatRoom.socketRoomBroadcast(connection, {
      message: connection.rawConnection.message,
      twitterUser: connection.rawConnection.twitterUser,
      hashtag: connection.rawConnection.hashtag,
    });
    connection.destroy();
  });

  /////////////
  // HELPERS //
  /////////////

  next(server);
}

/////////////////////////////////////////////////////////////////////
// exports
exports.twitter = twitter;

```

notes: 
- we didn't actually allow these clients to join the chatroom (`attributes.canChat = false`) because we don't want them to really appear as members of the chat room.
- we are however using the server-side chat api (`api.chatRoom.socketRoomBroadcast`) to send a custom message to the folks in the `twitter` chat room about the tweet

## Next Steps / TODO

- Use cookie-based authentication rather than requiring the password and userName to be sent with each request
- Migrate to another database 
- Implement a UI for the API 
- Tests should be more inclusive, and test failure cases
- Pagination for all the `*view` actions
