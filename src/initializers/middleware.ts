import { Initializer, action, Action } from "actionhero";
import * as Users from "./../modules/users";

export class AuthenticationMiddleware extends Initializer {
  constructor() {
    super();
    this.name = "authentication_middleware";
  }

  async initialize() {
    const middleware = {
      name: this.name,
      global: true,
      preProcessor: async ({
        actionTemplate,
        params,
      }: {
        actionTemplate: Action & { authenticated: boolean };
        params: { userName: string; password: string };
      }) => {
        if (actionTemplate.authenticated === true) {
          const match = await Users.authenticate(
            params.userName,
            params.password
          );
          if (!match) {
            throw Error(
              "Authentication Failed.  userName and password required"
            );
          }
        }
      },
    };

    action.addMiddleware(middleware);
  }
}
