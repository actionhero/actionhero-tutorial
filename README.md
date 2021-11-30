# Actionhero Tutorial

<div align="center">
  <img src="https://raw.github.com/actionhero/actionhero/master/public/logo/actionhero-small.png" alt="Actionhero Logo" />
</div>

- Created: June 22, 2013
- Updated: Sept 02, 2021

## ![Node.js CI](https://github.com/actionhero/actionhero-tutorial/workflows/Node.js%20CI/badge.svg)

This guide will walk you through the creation of the application in this repository, and in the process, you will learn some of the basics of [Actionhero](http://actionherojs.com).

You will become comfortable with the following topics:

**A simple Blogging API & site:**

- [Actionhero Tutorial](#actionhero-tutorial)
  - [!Node.js CI](#)
  - [Actionhero Resources](#actionhero-resources)
  - [Notes](#notes)
  - [Getting Started with a new actionhero Project](#getting-started-with-a-new-actionhero-project)
  - [Creating Modules](#creating-modules)
  - [Creating Actions](#creating-actions)
    - [Extending the `Action` Class](#extending-the-action-class)
  - [Routes](#routes)
  - [Middleware and Initializers](#middleware-and-initializers)
  - [Testing](#testing)
  - [Consuming the API via the Web](#consuming-the-api-via-the-web)
  - [Websockets](#websockets)
  - [Tasks](#tasks)
  - [Next Steps / TODO](#next-steps--todo)

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

- You are expected to have a basic familiarity with node.js and the command line
- You do not need to clone this repository to follow this guide. The code in this repository represents the final state of a project created with these instructions. The code in this project should serve as a reference.
- You should also be able to run this project by:
  - `git clone https://github.com/actionhero/actionhero-tutorial.git`
  - `cd actionhero-tutorial`
  - `npm install`
  - `npm run dev` or `npm start`
  - There are a few extra steps needed to persists data to Redis.
- This project uses [`Redis`](https://redis.io) as a database. You will need to have it installed on your computer.
- Remember that Actionhero is an API server, so we will be focusing on creating an API for blogging and chatting, and _applying_ that to a website rather than creating a beautiful website itself.

## Getting Started with a new actionhero Project

**files discussed in this section:**

- [config](https://github.com/actionhero/actionhero-tutorial/blob/master/src/config)

**relevant documentation section:**

- [Getting Started](https://www.actionherojs.com/get-started#getting-started)

Actionhero is a [node.js](https://www.nodejs.org) package. Be sure you have node.js (version >= 10.0.0) installed. Node comes with [npm](http://npmjs.org), the node package manager. `npm` includes a command `npx` we can use to run actionhero simply.

This guide was written on OSX It should be appropriate for any version of OSX > 10.6. It should also work on most Linux distributions (Ubuntu, CentOs, Fedora, etc). The concepts presented here should also be appropriate for windows users, but many of the "Getting Started" commands will not work as described here. If you are looking for help on getting started on Windows, please join the [Actionhero Slack Channel](https://www.actionherojs.com/community) to get help.

Create a new directory for this project and enter it (in the terminal):

- `mkdir ~/actionhero-tutorial`
- `cd ~/actionhero-tutorial`

**note:** From this point forward, it is assumed that all commands listed are run from within the `~/actionhero-tutorial` directory.

Use the Actionhero generator to build your project

- `npx actionhero generate`

Install any project dependencies

- `npm install`

Try to boot the Actionhero server in development mode

- `npm run dev`

You should see the default Actionhero welcome page at `http://localhost:8080/public` (visit in your browser)

The port `8080` is defined in `src/config/web.ts`, along with all other settings for Actionhero. Actionhero has two types of HTTP routes: static files and api routes. static files are served from `/public` and the API is served from `/api`. These routes are configurable from files within `/src/config`. Actionhero also picks one of these to be the default root route. This is defined by `config.web.rootEndpointType` in `src/config/web.ts`. We want our default route to serve our `index.html` file from `/public`, so we can leave this setting as "file".

Since you are running in development mode (`npm run dev`), Actionhero will notice you made a change to a config file and reboot the server automatically for you. Now, visit `http://localhost:8080/` and you should see the welcome page. You will note that the setting we just changed was under the `servers.web` section. This is because this setting is only relevant to HTTP clients, and not the others (websocket, etc). We will talk about these more later.

We should also enable all the servers which ship with Actionhero (websocket). Enable them by setting `enabled:true` in their config files.

Actionhero uses the variable `NODE_ENV` to determine which modification file to load from `/config/*` to load to modify the default values in `config`. This is how you can set different variables per environment. We will use this for testing later.

## Creating Modules

**files discussed in this section:**

- [modules/users.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/modules/users.ts)
- [modules/blog.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/modules/blog.ts)

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
  // users
  add: async function (...) {},
  list: async function (...) {},
  authenticate: async function (...) {},
  del: async function (...) {},
};
```

A few things to note:

- posts are hashes with the content and some additional metadata
- comments are also hashes, a key for each comment
- we always make asynchronous functions, using `async/await`.
- at this layer, we don't worry about authentication or validations. That will be handled in our Actions later on.
- we are making use of `api.redis.clients.client` to talk to redis. To make that simpler, we've made a `redis()` method to reference the redis client object for us.

## Creating Actions

**files discussed in this section:**

- [actions/users.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/actions/users.ts)
- [actions/blog.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/actions/blog.ts)

**relevant documentation section:**

- [Actions](https://www.actionherojs.com/tutorials/actions)

Now that we have our helpers for getting and setting blog posts, how can we allow users to use them? Actions!

The files in `/src/actions` can define a one or more Actions each, so let's create one for comments and one for posts.

- `npx actionhero generate-action --name=users`
- `npx actionhero generate-action --name=blog`

### Extending the `Action` Class

Actions can be extended by extending the `Action` class. We want to denote on each of our actions whether or not we require an authenticated user (to make a new post) or they are public (anyone can read the blog) - We'll use `action.authenticated = true` to denote that the action requires authentication. However, that property is not a normal property of the class `Action`. We can make a new class, `AuthenticatedAction` which we can then extend:

```ts
// from classes/authenticatedAction

import { Action } from "actionhero";

export abstract class AuthenticatedAction extends Action {
  authenticated: boolean;
}
```

## Routes

**files discussed in this section:**

- [routes.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/config/routes.ts)

**relevant documentation section:**

- [Routes](https://www.actionherojs.com/tutorials/web-server#Routes)

Now that we've defined our Actions, we want to expose them via the HTTP server. Actionhero does this via a `src/config/routes.ts` file. Routes allow different HTTP verbs to preform a different action on the same URL. We'll use a `config/routes.ts` file to transform our API into restful resources for users, comments, and posts. You can derive input variables from the structure of URLs with routing as well.

- I can add a user with `curl -X POST -d "userName=evan" -d "password=password" "http://localhost:8080/api/user"`
- I can log in with `curl -X POST -d "userName=evan" -d "password=password" "http://localhost:8080/api/authenticate"`
- I can create a post with `curl -X POST -d "password=password" -d "title=first-post" -d "content=My%20first%20post.%20%20Yay." http://localhost:8080/api/post/evan` (the user name is derived from the route)
- I can view that new post with `curl -X GET "http://localhost:8080/api/post/evan/first-post"`
- I can get a list of my posts with `curl -X GET http://localhost:8080/api/posts/evan`
- Another user could add a comment with: `curl -X POST -d "comment=cool%20post" -d "commenterName=Someone_Else" "http://localhost:8080/api/comment/evan/first-post"`
- And we can see the comments with: `curl -X GET "http://localhost:8080/api/comments/evan/first-post"`

Once you define your routes, you can visit the Swagger page (`http://localhost:8080/swagger`) to see the automatic documentation of your HTTP API Actions!

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/swagger.html.png"/>

## Middleware and Initializers

**files discussed in this section:**

- [initializers/middleware.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/initializers/middleware.ts)

**relevant documentation section:**

- [Middleware](https://www.actionherojs.com/tutorials/middleware)

In the steps above, we created a `users.authenticate` method, but didn't use it anywhere. We also denoted that we wanted some actions to be authenticated with `authenticated: true`, but didn't create any logic to do so... now we will with an `Action Middleware`.

First, Let's create a new initializer for this:

- `npx actionhero generate-initializer --name=middleware`

Middleware can run before and after every action (global), or just those actions that opt into them. In our case, we'll make a global middleware which applies to all actions and check if the action being run should be authenticated or not. The `preProcessor` lifecycle hook we are using will run before the Action, but will have access to the params sent by the user - like `userName` and `password` so we can check if they are correct.

Middleware are added to the api by adding them via `actions.addMiddleware(authenticationMiddleware)`.

## Testing

**files discussed in this section:**

- [package.json](https://github.com/actionhero/actionhero-tutorial/blob/master/package.json)
- [\_\_tests\_\_/integration (folder)](https://github.com/actionhero/actionhero-tutorial/tree/master/__tests__/integration)

When you generate a new Actionhero project, we will generate tests for you to be run with the [Jest](https://jestjs.io/) framework. Actionhero exposes a number of utilities to make it easy to boot up a server with configuration overrides to make testing easier. We'll also use the `request` package to make HTTP requests simpler in our tests. `npm install --save-dev request` (which will add the package to your `package.json` in the `devDependencies` section).

We can now run the test with the `jest` command. In our `package.json` we already have `npm test` configured to run the test suite how we would like it: `"test": "jest"`. Jest will automatically set `NODE_ENV=test` for us, to tell Actionhero we are running this command in the 'test' environment this will signal Actionhero load any config changes from the `/config` file's TEST configurations, if they are different. In our case, we set up redis and the servers a little differently when testing.

A successful test run looks like this:

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/jest.png"/>

We also use the npm lifecycle command `pretest` to run a linter, `prettier`. This helps our code to conform to a consistent style and will check for errors like variable scope or missing variables.

## Consuming the API via the Web

**files discussed in this section:**

- [public/index.html](https://github.com/actionhero/actionhero-tutorial/blob/master/public/index.html)

**relevant documentation section:**

- [Web](https://www.actionherojs.com/tutorials/web-server)

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/index.html.png"/>

Actionhero is primarily an API server, but it can still serve static files for you. In `config/api.ts`, the `config.general.paths.public` directive is where your web site's "root" is. You can also use actions to manipulate file content with the `api.staticFile.get` method. Actionhero is also a great choice to power your front-end applications (angular, react, ember, etc).

Provided in `index.html` is a simple page that demonstrates how to call an action to show some status about your sever, using the `status` action (generated with a new project).

## Websockets

**files discussed in this section:**

- [public/chat.html](https://github.com/actionhero/actionhero-tutorial/blob/master/public/chat.html)

**relevant documentation section:**

- [Websocket](https://www.actionherojs.com/tutorials/websocket-server)

<img src="https://raw.github.com/actionhero/actionhero-tutorial/master/images/chat.html.png"/>

`/public/chat.html` demonstrates how to use Actionhero's websockets. The `websocket` is a first-class protocol in Actionhero and has all the capabilities of `web` clients - and more! Web sockets are persistent connections which also enables Actionhero's chat room features. We will make use of them here.

Note how we make use of the event libraries of `actionheroWebsocket` and build our events around it. This library is accessed by including `/public/javascript/actionHeroClient.min.ts` in your html page.:

```javascript
client = new ActionheroWebsocketClient();

// register for events
client.on("connected", function () {
  console.log("connected!");
});
client.on("disconnected", function () {
  console.log("disconnected :(");
});
client.on("error", function (error) {
  console.log("error", error.stack);
});
client.on("reconnect", function () {
  console.log("reconnect");
});
client.on("reconnecting", function () {
  console.log("reconnecting");
});
client.on("welcome", function (message) {
  appendMessage(message);
});
client.on("say", function (message) {
  appendMessage(message);
});

client.connect(function (error, details) {
  if (error) {
    console.error(error);
  } else {
    // run an action
    client.action("createChatRoom", { name: "defaultRoom" }, function (data) {
      // join a chat room
      client.roomAdd("defaultRoom");
    });
  }
});
```

## Tasks

**files discussed in this section:**

- [tasks/stats.ts](https://github.com/actionhero/actionhero-tutorial/blob/master/src/tasks/stats.ts)

**relevant documentation section:**

- [Tasks](https://docs.actionherojs.com/tutorial-tasks.html)

Actionhero comes with a robust task system for delayed/recurring tasks. For our example, we are going to create a task which will log some stats to the command line every 30 seconds. You can do much more with Actionhero's task system, including distributed tasks, recurring tasks, and more.

`npx actionhero generate-task --name=stats --queue=default --frequency=30000`

- note how we set the `task.frequency` to run every 30 seconds
- to enable our server to run tasks, we need to configure 'workers' to run. You can enable `minTaskProcessors` and `maxTaskProcesssors` in `/src/config/tasks.ts` (set them both to 1).
- to re-schedule a job like ours, you will also need to enable the scheduler process in `/config/tasks.ts`.

## Next Steps / TODO

- Use cookie-based authentication rather than requiring the password and userName to be sent with each request
- Migrate to another database
- Implement a UI for the API
- Tests should be more inclusive, and test failure cases
- Pagination for all the `*view` actions
