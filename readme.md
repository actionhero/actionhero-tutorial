# actionHero Tutorial

<img src="https://raw.github.com/evantahler/actionHero/master/public/logo/actionHero.png" height="300"/>

- created: June 22, 2013
- updated: June 22, 2013

---

This guide will walk you through the creation of this application, and in the process you will learn some of the basics of actionHero.

You will become comfortable with the following topics:

**A simple Blogging API & site:**

- [Getting Started with a new actionHero Project]()
- [Creating Initializers]()
- [Users & Authentication]()
- [Public and Private actions with Middleware]()
- [Creating Actions]()
- [Routes]()
- [Testing]()
- [Consuming the API via the Web]()

**Adding a chat room**

- [Sockets]()
- [Websockets]()
- [Tasks]()

**Creating a Custom Server**

- [Custom Server]()
- [Custom Clients]()

**Next Steps**

- [Next Steps / TODO]()

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

```javascripot
<< FILL IN >>
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

```javascripot
<< FILL IN >>
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

```javascripot
<< FILL IN >>
```

## Creating Actions

Now that we have our helpers for getting and setting blog posts, how can we allow users to use them?  Actions!

Action files can define a few actions each, so lets create one for comments and one for posts.

- `./node_modules/.bin/actionHero generateAction --name=users`
- `./node_modules/.bin/actionHero generateAction --name=blog`

And here are our actions:

```javascripot
<< FILL IN >>
```

```javascripot
<< FILL IN >>
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

```javascripot
<< FILL IN >>
```
Now we can get the list of posts for user `evan` with `curl -X GET "http://localhost:8080/api/posts/evan"` and we don't need to pass any parameters. 

## Testing

There are many testing tools and packages which exist for nodejs.  actionHero is not opinionated about which testing framework you should use, but nonetheless, testing is important!  actionHero exposes a number of utilities to make it easy to boot up a server with configuration overrides to make testing easier.  

Lets setup a test with the `mocha` and `should` packages.  We'll use the `request` package to make HTTP requests simpler in our tests.

`npm install mocha should request` (and add them to your `package.json` in the `devDependencies` section).

First, lets create a spec helper in `test/_setup.js`

```javascripot
<< FILL IN >>
```

Now we can use our `_setup.js` in a test.  Let's create an integration test `/test/integration.js` for post creation and reading.  Note how we are using `fakeredis` so we have an isolated in-process test database to work with. 

```javascripot
<< FILL IN >>
```

We can now run the test with the `mocha` command.  In our `package.json` we can also setup `npm test` to run the test suite how we would like it: `"test": "node ./node_modules/.bin/mocha --reporter spec ./test"`

## Consuming the API via the Web

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

`/public/chat.js` demonstrates how to use actionHero's websockets.  The `websocket` is a first-class protocol in acitonHero and has all the capabilities of `web` and `socket`.  Like `socket`, it is a persistent connection which also enables actionHero's chat room features.  We will make use of them here.

Note that we include bot the JS for faye and the wrapper around it, `actionHeroWebSocket.js`

The faye transport will degrade to long-polling and finally http if those features are not available to either your clients or server.

## Tasks

actionHero comes with a robust task system for delayed / recurring tasks.  For our example, we are going to create a task which will log some stats to the command line every 30 seconds.  

`./node_modules/.bin/actionHero generateTask --name=stats`

```javascripot
<< FILL IN >>
```

- note how we set the `task.frequency` to run every 30 seconds
- the scope of this task is `all`, as we want every server we might run this task on to display these stats
- `configData.general.simultaniousActions` in `config.js` defines how many tasks will be run at once per server.  You can have some instances of your application running tasks while others won't.

## Custom Server

## Custom Clients

## Next Steps / TODO

- Use cookie-based authentication rather than requiring the password and userName to be sent with each request
- Migrate to another database 
- Implement a UI for the API 
- Tests should be more inclusive, and test failure cases
- Pagination for all the `*view` actions
