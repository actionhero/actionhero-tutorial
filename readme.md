# actionhero Tutorial

<img src="https://raw.github.com/actionhero/actionhero/master/public/logo/actionhero.png" height="300"/>

- created: June 22, 2013
- updated: September 28, 2017

[![Build Status](https://circleci.com/gh/actionhero/actionhero-tutorial.png)](https://circleci.com/gh/actionhero/actionhero-tutorial.png)

---

This guide will walk you through the creation of the application in this repository, and in the process you will learn some of the basics of [ActionHero](http://actionherojs.com).

You will become comfortable with the following topics:

**A simple Blogging API & site:**

- [Getting Started with a new ActionHero Project](#getting-started-with-a-new-actionhero-project)
- [Creating Initializers](#creating-initializers)
- [Users & Authentication](#users--authentication)
- [Public and Private actions with Middleware](#public-and-private-actions-with-middleware)
- [Creating Actions](#creating-actions)
- [Routes](#routes)
- [Testing](#testing)
- [Consuming the API via the Web](#consuming-the-api-via-the-web)

**Adding a chat room**

- [Sockets](#sockets)
- [Websockets](#websockets)
- [Tasks](#tasks)

**Creating a Custom Server**

- [Custom Server](#custom-server)

**Next Steps**

- [actionhero Links](#actionhero-links)
- [Notes](#notes)
- [Next Steps / TODO](#next-steps--todo)

## actionhero Resources
- [Public Site](http://www.actionherojs.com)
- [NPM](https://npmjs.org/package/actionhero)
- [Documentation](http://actionherojs.com/docs)
- [GitHub](https://github.com/actionhero/actionhero)
- [Chat / Slack](http://slack.actionherojs.com)
- [Mailing List](https://groups.google.com/forum/?fromgroups=#!forum/actionhero-js)

## Notes

- You are expected to have a basic familiarity with node.js and the command line
- You do not need to clone this repository to follow this guide.  The code in this repository represents the final state of a project created with these instructions.  The code in this project should serve as a reference.  
- You should also be able to run this project by:
  - `git clone https://github.com/actionhero/actionhero-tutorial.git`
  - `cd actionhero-tutorial`
  - `npm install`
  - `npm start`
  - There are a few extra steps needed to persists data to redis.
- This project uses redis as a database.  You will need to have it installed on your computer.
- Remember that ActionHero is an API server, so we will be focusing on creating an API for blogging and chatting, and *applying* that to a website rather than creating a beautiful website itself.

## Getting Started with a new actionhero Project

**files discussed in this section:**

- [config](https://github.com/actionhero/actionhero-tutorial/blob/master/config)

**relevant documentation section:**

- [Getting Started](http://www.actionherojs.com/docs/#getting-started)

ActionHero is a node.js package.  Be sure you have node.js (version >= 8.0.0) installed.  Node comes with [npm](http://npmjs.org), the node package manager.  `npm` includes a command `npx` we can use to run actionhero simply.

This guide was written on OSX  It should be appropriate for any version of OSX > 10.6.  It should also work on most Linux distributions (Ubuntu, CentOs, Fedora, etc).  The concepts presented here should also be appropriate for windows users, but many of the "Getting Started" commands will not work as described here.  If you are looking for help on getting started on Windows, Mark Tucker has [a video tutorial for windows users](http://www.youtube.com/watch?v=PwbuJM03XFc)

Create a new directory for this project and enter it (in the terminal):

- `mkdir ~/actionhero-tutorial`
- `cd ~/actionhero-tutorial`

**note:** From this point forward, it is assumed that all commands listed are run from within the `~/actionhero-tutorial` directory.

Install the actionhero package locally from NPM:

- `npm install actionhero`

Use the ActionHero generator to build your project

- `npx actionhero generate`

Install any project dependancies

- `npm install`

Try to boot the ActionHero server

- `npm start`

You should see the default ActionHero welcome page at `http://localhost:8080/public` (visit in your browser)

The port `8080` is defined in `/config/servers/web.js`, along with all other settings for ActionHero.  ActionHero has two types of http routes: static files and api routes.  static files are served from `/public` and the api is served from `/api`.  These routes are configurable.  ActionHero also picks one of these to be the default root route.  This is defined by `api.config.servers.web.rootEndpointType`.  As we want to make a website, lets change that from `api` to `file`.

Restart your server by pressing `ctrl+c` in the terminal window running ActionHero.  Start up the server again (`npm start`) and visit `http://localhost:8080/` and you should see the welcome page.  You will note that the setting we just changed was under the `servers.web` section.  This is because this setting is only relevant to HTTP clients, and not the others (socket, websocket, etc).  We will talk about these more later.

We should also enable all the servers which ship with ActionHero (web, websocket, and socket).  Enable their sections in their config files

Lets change one more thing in `config/api.js`: development mode.  Change `api.config.general.developmentMode = true`  Development mode is helpful while creating a new application as it will automatically restart your server on configuration changes, and watch and reload your actions and tasks as you change them.

ActionHero uses the variable `NODE_ENV` to determine which modification file to load from `/config/*` to load to modify the default values in `api.config`.  This is how you can set different variables per environment.  We will use this for testing later.

## Creating Initializers

**files discussed in this section:**

- [initializers/blog.js](https://github.com/actionhero/actionhero-tutorial/blob/master/initializers/blog.js)

**relevant documentation section:**

- [Initializers](http://www.actionherojs.com/docs/#initializers)

Initializers in ActionHero are places to save common code which other parts of your application will use.  Here is where you might connect to your database or define middlewares.  Normally, you append your new classes to the `api` object so it becomes available in scope for your actions and tasks (like `api.mysql` or `api.game`).  When your server boots, you can optionally execute code within a `start` method.

Because we are building a blog, first we will need a place to store our entries and comments.  As ActionHero already has redis available under `api.redis.client`, lets use that for our data store.

Create a new initializer for the blog's common functions:

- `npx actionhero generate initializer --name=blog`

I'll define some common blog functions we'll use later in actions in `initializers/blog.js`

Our blogging methods are:

```javascript
api.blog = {
  // constants
  separator: ";",
  postPrefix: "posts",
  commentPrefix: "comments:",
  // posts
  postAdd: function(userName, title, content){},
  postView: function(userName, title){},
  postsList: function(userName){},
  postEdit: function(userName, title, content){},
  postDelete: function(userName, title){},
  // comments
  commentAdd: function(userName, title, commenterName, comment){},
  commentsView: function(userName, title){},
  commentDelete: function(userName, title, commentId){},
}
```

A few things to note:
- posts are hashes with the content and some additional meta data
- comments are also hashes, a key for each comment
- we always make asynchronous functions, using `async/await`.  ActionHero does not use the callback pattern.
- at this layer, we don't worry about authentication or validations

## Users & Authentication

**files discussed in this section:**

- [initializers/users.js](https://github.com/actionhero/actionhero-tutorial/blob/master/initializers/users.js)
- [package.json](https://github.com/actionhero/actionhero-tutorial/blob/master/package.json)

We know we will need to authenticate users to our blog, so lets make another initializer to handle this as well.

- `npx actionhero generate initializer --name=users`

Our user methods are:

```javascript
api.users = {
  // constants
  usersHash: "users",
  // methods
  add: function(userName, password){},
  list: function(){},
  authenticate: function(userName, password){},
  delete: function(userName, password){},
}
```

Notes:
- We are again storing all data in a redis hash
- If we delete a user, we should delete all the posts and comments from them

## Public and Private actions with Middleware

**files discussed in this section:**

- [initializers/middleware.js](https://github.com/actionhero/actionhero-tutorial/blob/master/initializers/middleware.js)

**relevant documentation section:**

- [Middleware](http://www.actionherojs.com/docs/#middleware)

In the steps above, we created a `api.users.authenticate` method, but didn't use it anywhere.  There are clearly methods which should be protected (like adding a post, or deleting a user), but we need to safeguard them somehow.  

In ActionHero, we know that we will wrap any use of our initializer's methods by users in `actions`, so we can create a middleware which we can apply to these `actions`.  

Let's create a new initializer for this:

- `npx actionhero generate initializer --name=middleware`

There are arrays of functions in ActionHero which will be run before an after every action.  Here, we only need a check before to see if an action should be run.  You have access to the action itself, along with the connection.  

The middleware we created allows us to simply append `action.authenticated = true` to the action definition, and the middleware will be invoked.

Middlewares are stored to the api by adding them via `api.actions.addMiddleware(authenticationMiddleware)`.

## Creating Actions

**files discussed in this section:**

- [actions/users.js](https://github.com/actionhero/actionhero-tutorial/blob/master/actions/users.js)
- [actions/blog.js](https://github.com/actionhero/actionhero-tutorial/blob/master/actions/blog.js)

**relevant documentation section:**

- [Actions](http://www.actionherojs.com/docs/#actions)

Now that we have our helpers for getting and setting blog posts, how can we allow users to use them?  Actions!

Action files can define a few actions each, so lets create one for comments and one for posts.

- `npx actionhero generate action --name=users`
- `npx actionhero generate action --name=blog`

Note how we added `action.authenticated = true` on the actions which required security.   

Now we can use CURL to test out our API!  Note that right now, all HTTP methods will work (get, post, etc).  We'll be setting up routing next.  Be sure to URL-encode all your input.

- Add a user:
  - `curl -X POST -d "userName=evan" -d "password=password" "http://localhost:8080/api/userAdd"`
- Check that you can log in:
  - `curl -X POST -d "userName=evan" -d "password=password" "http://localhost:8080/api/authenticate"`
- Add a post:
  - `curl -X POST -d "userName=evan" -d "password=password" -d "title=first-post" -d "content=My%20first%20post.%20%20Yay." "http://localhost:8080/api/postAdd"`
- View the post
  - `curl -X POST -d "userName=evan" -d "title=first-post" "http://localhost:8080/api/postView"`
- Add a comment
  - `curl -X POST -d "userName=evan" -d "title=first-post" -d "comment=cool%20post" -d "commenterName=someoneElse" "http://localhost:8080/api/commentAdd"`
- View the comments
  - `curl -X POST -d "userName=evan" -d "title=first-post" "http://localhost:8080/api/commentsView"`

## Routes

**files discussed in this section:**

- [routes.js](https://github.com/actionhero/actionhero-tutorial/blob/master/config/routes.js)

**relevant documentation section:**

- [Web](http://www.actionherojs.com/docs/#web-server)

We have the basics of our API working, but it might be tedious to keep using GET and POST params. It's time to set up routes.  Routes allow different HTTP verbs to preform a different action on the same URL.  We'll use a `config/routes.js` file to transform our API into restful resources for users, comments, and posts.  You can derive input variables from the structure of URLs with routing as well.

Now we can get the list of posts for user `evan` with `curl -X GET "http://localhost:8080/api/posts/evan"` and we don't need to pass any parameters.

- I can get a list of my posts with `http://localhost:8080/api/posts/evan`
- I can view a post with `http://localhost:8080/api/post/evan/first-post`
- etc

## Testing

**files discussed in this section:**

- [package.json](https://github.com/actionhero/actionhero-tutorial/blob/master/package.json)
- [test/integration (folder)](https://github.com/actionhero/actionhero-tutorial/tree/master/test/integration)

There are many testing tools and packages which exist for nodejs.  ActionHero is not opinionated about which testing framework you should use, but nonetheless, testing is important!  ActionHero exposes a number of utilities to make it easy to boot up a server with configuration overrides to make testing easier.  

Lets setup a test with the `mocha` and `chai` packages.  We'll use the `request` package to make HTTP requests simpler in our tests.

`npm install mocha should request` (and add them to your `package.json` in the `devDependencies` section).

We can now run the test with the `mocha` command.  In our `package.json` we can also setup `npm test` to run the test suite how we would like it: `"test": "NODE_ENV=test ./node_modules/.bin/mocha --reporter spec ./test"`.  Note how we are calling `NODE_ENV=test` to tell ActionHero we are running this command in the 'test' environment this will signal ActionHero load any configChanges from the `/config/environments/test.js` file.  Here we setup redis and the servers how we want for testing.

A successful test run looks like this:

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/mocha.jpg"/>

We also use the npm lifecycle command `pretest` to run a linter, `standard`.  This helps our code to conform to a consistent style and will check for errors like variable scope.

## Consuming the API via the Web

**files discussed in this section:**

- [public/index.html](https://github.com/actionhero/actionhero-tutorial/blob/master/public/index.html)

**relevant documentation section:**

- [Web](http://www.actionherojs.com/docs/#web-server)

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/index.html.png"/>

ActionHero is primarily an API server, but it can still serve static files for you.  In `config/api.js`, the `api.config.general.paths.public` directive is where your web site's "root" is.  You can also use actions to manipulate file content with the `api.staticFile.get` method.  ActionHero is also a great choice to power your front-end applications (angular.js, ember, etc).

Provided in `index.html` is a simple page which demonstrates how simple it is to call an action from the web to document the API we have created.  If you visit the the `showDocumentation` action (generated with a new project), ActionHero will describe it's capabilities, and we can then render them on our web page.

## Sockets

**relevant documentation section:**

- [Socket](http://www.actionherojs.com/docs/#websocket-server)

While this application probably makes the most sense being used in a web browser, ActionHero can still provide a TCP/Socket API for clients who wish to use it.   There is nothing new you need to do to enable it other than set `enabled` in `./config/servers/socket.js`.  

Let's add a comment with the socket API and Telnet.  We'll make some mistakes so you can see how error responses are handled.  You will also notice how with TCP clients, params are 'sticky' by default, and you only need to set them once per session.

```bash
> telnet localhost 5000

Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.

{"welcome":"Hello! Welcome to the actionhero api","room":"defaultRoom","context":"api"}
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

**files discussed in this section:**

- [public/chat.html](https://github.com/actionhero/actionhero-tutorial/blob/master/public/chat.html)
- [public/javascripts/actionheroWebSocket.js](https://github.com/actionhero/actionhero-tutorial/blob/master/public/javascript/actionheroWebSocket.js)

**relevant documentation section:**

- [Websocket](http://www.actionherojs.com/docs/#websocket-server)

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/chat.html.png"/>

`/public/chat.js` demonstrates how to use ActionHero's websockets.  The `websocket` is a first-class protocol in ActionHero and has all the capabilities of `web` and `socket`.  Like `socket`, it is a persistent connection which also enables ActionHero's chat room features.  We will make use of them here.

Note that we include both the javascript `actionheroWebSocket.js`

Note how we make use of the event libraries of `actionheroWebsocket` and build our events around it.  This librars is accessed by including `/public/javascript/actionHeroClient.min.js` in your html page.:

``` javascript
A = new actionheroWebSocket;

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
  }
});
```

## Tasks

**files discussed in this section:**

- [tasks/stats.js](https://github.com/actionhero/actionhero-tutorial/blob/master/tasks/stats.js)

**relevant documentation section:**

- [Tasks](http://www.actionherojs.com/docs/#tasks)

ActionHero comes with a robust task system for delayed / recurring tasks.  For our example, we are going to create a task which will log some stats to the command line every 30 seconds.   You can do much more with ActionHero's task system, including distributed tasks, recurring tasks, and more.

`npx actionhero generate task --name=stats --queue=default --frequency=30000`

- note how we set the `task.frequency` to run every 30 seconds
- to enable our server to run tasks, we need to configure 'workers' to run.  You can enable `minTaskProcessors` and `maxTaskProcesssors` in `/config/tasks.js` (set them both to 1).
- to re-scheudle a job like ours, you will also need to enable the scheduler process in `/config/tasks.js`.

## Next Steps / TODO

- Use cookie-based authentication rather than requiring the password and userName to be sent with each request
- Migrate to another database
- Implement a UI for the API
- Tests should be more inclusive, and test failure cases
- Pagination for all the `*view` actions
