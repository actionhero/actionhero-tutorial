import { Initializer, api, action } from "actionhero";

export class AuthenticationMiddleware extends Initializer {
  constructor() {
    super();
    this.name = "authentication_middleware";
  }

  async initialize() {
    const middleware = {
      name: this.name,
      global: true,
      preProcessor: async ({ actionTemplate, params }) => {
        if (actionTemplate.authenticated === true) {
          const match = await api.users.authenticate(
            params.userName,
            params.password
          );
          if (!match) {
            throw Error(
              "Authentication Failed.  userName and password required"
            );
          }
        }
      }
    };

    action.addMiddleware(middleware);
  }
}
