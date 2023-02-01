import { RoutesConfig } from "actionhero";

const namespace = "routes";

declare module "actionhero" {
  export interface ActionheroConfigInterface {
    [namespace]: ReturnType<(typeof DEFAULT)[typeof namespace]>;
  }
}

export const DEFAULT: { [namespace]: () => RoutesConfig } = {
  [namespace]: () => {
    return {
      get: [
        { path: "/status", action: "status" },
        { path: "/swagger", action: "swagger" },
        { path: "/users", action: "usersList" },
        { path: "/comments/:userName/:title", action: "commentsView" },
        { path: "/post/:userName/:title", action: "postView" },
        { path: "/posts/:userName/", action: "postsList" },
      ],

      post: [
        { path: "/authenticate", action: "authenticate" },
        { path: "/user", action: "userAdd" },
        { path: "/comment/:userName/:title", action: "commentAdd" },
        { path: "/post/:userName/", action: "postAdd" },
      ],

      put: [{ path: "/post/:userName/:title", action: "postEdit" }],

      delete: [
        { path: "/user/:userName", action: "userDelete" },
        {
          path: "/comment/:userName/:title/:commentId",
          action: "commentDelete",
        },
        { path: "/post/:userName/:title", action: "postDelete" },
      ],
    };
  },
};
