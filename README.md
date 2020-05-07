# Actionhero Tutorial

<div align="center">
  <img src="https://raw.github.com/actionhero/actionhero/master/public/logo/actionhero-small.png" alt="Actionhero Logo" />
</div>

- Created: June 22, 2013
- Updated: Feb 23, 2020

## ![Node.js CI](https://github.com/actionhero/actionhero-tutorial/workflows/Node.js%20CI/badge.svg)

This guide will walk you through the creation of the application in this repository, and in the process, you will learn some of the basics of [Actionhero](http://actionherojs.com).

You will become comfortable with the following topics:

**A simple Blogging API & site:**

- [Getting Started with a new Actionhero Project](#getting-started-with-a-new-actionhero-project)
- [Creating Initializers](#creating-initializers)
- [Users & Authentication](#users--authentication)
- [Public and Private actions with Middleware](#public-and-private-actions-with-middleware)
- [Creating Actions](#creating-actions)
- [Routes](#routes)
- [Testing](#testing)
- [Consuming the API via the Web](#consuming-the-api-via-the-web)

**Adding a chat room**

- [Websockets](#websockets)
- [Tasks](#tasks)

**Next Steps**

- [actionhero Links](#actionhero-links)
- [Notes](#notes)
- [Next Steps / TODO](#next-steps--todo)

## Actionhero Resources

- [WebSite](http://www.actionherojs.com)
- [Documentation](https://docs.actionherojs.com)
- [GitHub](https://github.com/actionhero/actionhero)
- [Chat / Slack](https://slack.actionherojs.com)

## Notes

- You are expected to have a basic familiarity with node.ts and the command line
- You do not need to clone this repository to follow this guide. The code in this repository represents the final state of a project created with these instructions. The code in this project should serve as a reference.
- You should also be able to run this project by:
  - `git clone https://github.com/actionhero/actionhero-tutorial.git`
  - `cd actionhero-tutorial`
  - `npm install`
  - `npm start`
  - There are a few extra steps needed to persists data to Redis.
- This project uses Redis as a database. You will need to have it installed on your computer.
- Remember that Actionhero is an API server, so we will be focusing on creating an API for blogging and chatting, and _applying_ that to a website rather than creating a beautiful website itself.

## Getting Started with a new actionhero Project

**files discussed in this section:**

- [config](https://github.com/actionhero/actionhero-tutorial/blob/master/config)

**relevant documentation section:**

- [Getting Started](https://www.actionherojs.com/get-started#getting-started)

Actionhero is a node.ts package. Be sure you have node.ts (version >= 8.0.0) installed. Node comes with [npm](http://npmjs.org), the node package manager. `npm` includes a command `npx` we can use to run actionhero simply.

This guide was written on OSX It should be appropriate for any version of OSX > 10.6. It should also work on most Linux distributions (Ubuntu, CentOs, Fedora, etc). The concepts presented here should also be appropriate for windows users, but many of the "Getting Started" commands will not work as described here. If you are looking for help on getting started on Windows, Mark Tucker has [a video tutorial for windows users](http://www.youtube.com/watch?v=PwbuJM03XFc)

Create a new directory for this project and enter it (in the terminal):

- `mkdir ~/actionhero-tutorial`
- `cd ~/actionhero-tutorial`

**note:** From this point forward, it is assumed that all commands listed are run from within the `~/actionhero-tutorial` directory.

Use the Actionhero generator to build your project

- `npx actionhero generate`

Install any project dependencies

- `npm install`

Try to boot the Actionhero server

- `npm start`

You should see the default Actionhero welcome page at `http://localhost:8080/public` (visit in your browser)

The port `8080` is defined in `/config/servers/web.ts`, along with all other settings for Actionhero. Actionhero has two types of HTTP routes: static files and api routes. static files are served from `/public` and the API is served from `/api`. These routes are configurable. Actionhero also picks one of these to be the default root route. This is defined by `api.config.servers.web.rootEndpointType`. As we want to make a website, let's change that from `api` to `file`.

Restart your server by pressing `ctrl+c` in the terminal window running Actionhero. Start up the server again (`npm start`) and visit `http://localhost:8080/` and you should see the welcome page. You will note that the setting we just changed was under the `servers.web` section. This is because this setting is only relevant to HTTP clients, and not the others (websocket, etc). We will talk about these more later.

We should also enable all the servers which ship with Actionhero (web, websocket). Enable their sections in their config files

Let's change one more thing in `config/api.ts`: development mode. Change `api.config.general.developmentMode = true` Development mode is helpful while creating a new application as it will automatically restart your server on configuration changes, and watch and reload your actions and tasks as you change them.

Actionhero uses the variable `NODE_ENV` to determine which modification file to load from `/config/*` to load to modify the default values in `config`. This is how you can set different variables per environment. We will use this for testing later.

## Creating Modules

**files discussed in this section:**

- [modules/users.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/initializers/users.ts)
- [modules/blog.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/initializers/blog.ts)

**relevant documentation section:**

Modules are common libraries you create to help you manipulate data. These are normal Typescript functions/modules/classes. Here, we will build 2 that help us manage users and posts. Typescript will then make all the methods and classes available for us in the rest of our application once we require the module

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/module.png"/>

I'll define some common blog functions we'll use later in actions in `initializers/blog.ts`

Our blogging methods are:

```ts
Const Blog = {
  // posts
  postAdd: async function(...) {},
  postView: async function(...) {},
  postsList: async function(...) {},
  postEdit: async function(...) {},
  postDelete: async function(...) {},
  // comments
  commentAdd: async function(...) {},
  commentsView: async function(...) {},
  commentDelete: async function(...) {}
};

Const Users = {
  // posts
  add: async function (...) {},
  list: async function (...) {},
  authenticate: async function (...) {},
  del: async function (...) {},
};
```

A few things to note:

- posts are hashes with the content and some additional meta data
- comments are also hashes, a key for each comment
- we always make asynchronous functions, using `async/await`. Actionhero does not use the callback pattern.
- at this layer, we don't worry about authentication or validations
- we are making use of `api.redis.clients.client` to talk to redis. Since we don't know when in the Actionhero lifecycle this module will be first loaded, we cannot be sure that the client is ready. That's why we made a getter method, `redis()`

## Public and Private actions with Middleware

**files discussed in this section:**

- [initializers/middleware.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/initializers/middleware.ts)

**relevant documentation section:**

- [Middleware](https://docs.actionherojs.com/tutorial-middleware.html)

In the steps above, we created a `users.authenticate` method, but didn't use it anywhere. There are actions which should be protected (like adding a post, or deleting a user), but we need to safeguard them somehow.

In Actionhero, we know that we will wrap any use of our initializers' methods by users in `actions`, so we can create a middleware which we can apply to these `actions`.

Let's create a new initializer for this:

- `npx actionhero generate initializer --name=middleware`

There are arrays of functions in Actionhero which will be run before and after every action. Here, we only need a check before to see if an action should be run. You have access to the action itself, along with the connection.

The middleware we created allows us to simply append `action.authenticated = true` to the action definition, and the middleware will be invoked.

Middleware are stored to the api by adding them via `api.actions.addMiddleware(authenticationMiddleware)`.

## Creating Actions

**files discussed in this section:**

- [actions/users.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/actions/users.ts)
- [actions/blog.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/actions/blog.ts)

**relevant documentation section:**

- [Actions](https://docs.actionherojs.com/tutorial-actions.html)

Now that we have our helpers for getting and setting blog posts, how can we allow users to use them? Actions!

Action files can define a few actions each, so let's create one for comments and one for posts.

- `npx actionhero generate action --name=users`
- `npx actionhero generate action --name=blog`

Note how we added `action.authenticated = true` on the actions which required security. However, that property is not a normal property of the class `Action`. We can make a new class, `AuthenticatedAction` which we can then extend:

```ts
// from classes/authenticatedAction

import { Action } from "actionhero";

export abstract class AuthenticatedAction extends Action {
  authenticated: boolean;
}
```

Now we can use CURL to test out our API! Note that right now, all HTTP methods will work (get, post, etc). We'll be setting up routing next. Be sure to URL-encode all your input.

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

- [routes.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/config/routes.ts)

**relevant documentation section:**

- [Web](https://docs.actionherojs.com/tutorial-web-server.html)

We have the basics of our API working, but it might be tedious to keep using GET and POST params. It's time to set up routes. Routes allow different HTTP verbs to preform a different action on the same URL. We'll use a `config/routes.ts` file to transform our API into restful resources for users, comments, and posts. You can derive input variables from the structure of URLs with routing as well.

Now we can get the list of posts for user `evan` with `curl -X GET "http://localhost:8080/api/posts/evan"` and we don't need to pass any parameters.

- I can get a list of my posts with `http://localhost:8080/api/posts/evan`
- I can view a post with `http://localhost:8080/api/post/evan/first-post`
- etc

## Testing

**files discussed in this section:**

- [package.tson](https://github.com/actionhero/actionhero-tutorial/blob/master/package.tson)
- [test/integration (folder)](https://github.com/actionhero/actionhero-tutorial/tree/master/__tests__/integration)

There are many testing tools and packages which exist for nodejs. Actionhero is not opinionated about which testing framework you should use, but nonetheless, testing is important! Actionhero exposes a number of utilities to make it easy to boot up a server with configuration overrides to make testing easier.

Let's set up a test with the `jest` package. We'll use the `request` package to make HTTP requests simpler in our tests.

`npm install --save-dev jest request` (and add them to your `package.tson` in the `devDependencies` section).

We can now run the test with the `jest` command. In our `package.tson` we can also set up `npm test` to run the test suite how we would like it: `"test": "jest"`. Jest will automatically set `NODE_ENV=test` for us, to tell Actionhero we are running this command in the 'test' environment this will signal Actionhero load any config changes from the `/config/environments/test.ts` file. Here we setup redis and the servers how we want for testing.

A successful test run looks like this:

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/jest.png"/>

We also use the npm lifecycle command `pretest` to run a linter, `standard`. This helps our code to conform to a consistent style and will check for errors like variable scope.

## Consuming the API via the Web

**files discussed in this section:**

- [public/index.html](https://github.com/actionhero/actionhero-tutorial/blob/master/public/index.html)

**relevant documentation section:**

- [Web](https://docs.actionherojs.com/tutorial-web-server.html)

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/index.html.png"/>

Actionhero is primarily an API server, but it can still serve static files for you. In `config/api.ts`, the `api.config.general.paths.public` directive is where your web site's "root" is. You can also use actions to manipulate file content with the `api.staticFile.get` method. Actionhero is also a great choice to power your front-end applications (angular.ts, ember, etc).

Provided in `index.html` is a simple page that demonstrates how simple it is to call an action from the web to document the API we have created. If you visit the `showDocumentation` action (generated with a new project), Actionhero will describe it's capabilities, and we can then render them on our web page.

## Websockets

**files discussed in this section:**

- [public/chat.html](https://github.com/actionhero/actionhero-tutorial/blob/master/public/chat.html)
- [public/javascripts/actionheroWebSocket.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/public/javascript/actionheroWebSocket.ts)

**relevant documentation section:**

- [Websocket](https://docs.actionherojs.com/tutorial-websocket-server.html)

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/chat.html.png"/>

`/public/chat.ts` demonstrates how to use Actionhero's websockets. The `websocket` is a first-class protocol in Actionhero and has all the capabilities of `web` and `socket`. Like `socket`, it is a persistent connection which also enables Actionhero's chat room features. We will make use of them here.

Note that we include both the javascript `actionheroWebSocket.ts`

Note how we make use of the event libraries of `actionheroWebsocket` and build our events around it. This library is accessed by including `/public/javascript/actionHeroClient.min.ts` in your html page.:

```javascript
A = new actionheroWebSocket();

A.events = {
  say: function (message) {
    A.log(message);
    appendMessage(message);
  },
  alert: function (message) {
    alert(message.message);
  },
  welcome: function (message) {
    A.log(message);
    appendMessage(message);
  },
};

A.connect(function (err, details) {
  if (err != null) {
    A.log(err);
  } else {
    A.log("CONNECTED");
  }
});
```

## Tasks

**files discussed in this section:**

- [tasks/stats.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/tasks/stats.ts)

**relevant documentation section:**

- [Tasks](https://docs.actionherojs.com/tutorial-tasks.html)

Actionhero comes with a robust task system for delayed/recurring tasks. For our example, we are going to create a task which will log some stats to the command line every 30 seconds. You can do much more with Actionhero's task system, including distributed tasks, recurring tasks, and more.

`npx actionhero generate task --name=stats --queue=default --frequency=30000`

- note how we set the `task.frequency` to run every 30 seconds
- to enable our server to run tasks, we need to configure 'workers' to run. You can enable `minTaskProcessors` and `maxTaskProcesssors` in `/config/tasks.ts` (set them both to 1).
- to re-schedule a job like ours, you will also need to enable the scheduler process in `/config/tasks.ts`.

## Next Steps / TODO

- Use cookie-based authentication rather than requiring the password and userName to be sent with each request
- Migrate to another database
- Implement a UI for the API
- Tests should be more inclusive, and test failure cases
- Pagination for all the `*view` actions
