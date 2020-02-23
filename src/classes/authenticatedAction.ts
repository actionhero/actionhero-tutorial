import { Action } from "actionhero";

export abstract class AuthenticatedAction extends Action {
  authenticated: boolean;
}
