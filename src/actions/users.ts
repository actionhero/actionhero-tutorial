import { ParamsFrom } from "actionhero";
import { AuthenticatedAction } from "./../classes/authenticatedAction";
import * as Users from "./../modules/users";

export class UserAdd extends AuthenticatedAction {
  name = "userAdd";
  description = "I add a user";
  outputExample = {};
  authenticated = false;
  inputs = {
    userName: { required: true },
    password: { required: true },
  };

  async run({ params }: { params: ParamsFrom<UserAdd> }) {
    await Users.add(params.userName, params.password);
    return { success: true };
  }
}

export class UserDelete extends AuthenticatedAction {
  name = "userDelete";
  description = "I delete a user";
  outputExample = {};
  authenticated = true;
  inputs = {
    userName: { required: true },
    password: { required: true },
  };

  async run({ params }: { params: ParamsFrom<UserDelete> }) {
    await Users.del(params.userName);
  }
}

export class UsersList extends AuthenticatedAction {
  name = "usersList";
  description = "I list all the users";
  outputExample = {};
  authenticated = false;
  inputs = {};

  async run() {
    const users = await Users.list();
    return {
      users: users.map((user) => {
        return user.userName;
      }),
    };
  }
}

export class Authenticate extends AuthenticatedAction {
  name = "authenticate";
  description = "I authenticate a user";
  outputExample = {};
  authenticated = false;
  inputs = {
    userName: { required: true },
    password: { required: true },
  };

  async run({ params }: { params: ParamsFrom<Authenticate> }) {
    const authenticated = await Users.authenticate(
      params.userName,
      params.password
    );

    if (!authenticated) {
      throw new Error("unable to log in");
    }

    return { authenticated };
  }
}
