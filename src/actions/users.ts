import { api } from "actionhero";
import { AuthenticatedAction } from "./../classes/authenticatedAction";

exports.userAdd = class UserAdd extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "userAdd";
    this.description = "I add a user";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {
      userName: { required: true },
      password: { required: true }
    };
  }

  async run({ params }) {
    await api.users.add(params.userName, params.password);
  }
};

exports.userDelete = class UserDelete extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "userDelete";
    this.description = "I delete a user";
    this.outputExample = {};
    this.authenticated = true;
    this.inputs = {
      userName: { required: true },
      password: { required: true }
    };
  }

  async run({ params }) {
    await api.users.delete(params.userName, params.password);
  }
};

exports.usersList = class UsersList extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "usersList";
    this.description = "I list all the users";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {};
  }

  async run({ response, params }) {
    const users = await api.users.list();
    response.users = users.map(user => {
      return user.userName;
    });
  }
};

exports.authenticate = class Authenticate extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "authenticate";
    this.description = "I authenticate a user";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {
      userName: { required: true },
      password: { required: true }
    };
  }

  async run({ response, params }) {
    response.authenticated = await api.users.authenticate(
      params.userName,
      params.password
    );
    if (!response.authenticated) {
      throw new Error("unable to log in");
    }
  }
};
