# actionHero Tutorial
- created: June 22, 2013
- updated: June 22, 2013

This guide will walk you through the creation of this application, and in the process you will learn some of the basics of actionHero.

You will become comfortable with the following topics:

 << TOPICS HERE >>

## Notes

- The code in this repository represents the final state of a project created with these instructions.  The code in this project should server as a reference.  **You do not need to check out this repository to follow this guide**
- It is assumed that you have basic familiarity with node.js and the command line.
- This project uses redis as a database.  actionHero comes with 'fakeRedis', which is an in-process redis server, but it does not persist data.  If you want to use this process in a cluster or across multiple servers, you need to install and use a real redis server.  Change the appropriate `redis` sections in `config.js` to enable this.

## Getting Started

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

Lets change one more thing in `config.js`: development mode.  Change `configData.general.developmentMode = true;`  Development mode is helpful while creating a new application as it will automatically restart your server on config changes, and watch and reload your actions and tasks as you change them.  Keep in mind that you will still need to manually restart your server if you make any changes to your initializers. 

