import { log, api, Task } from "actionhero";

export class Stats extends Task {
  name = "stats task";
  description = "I report the stats";
  frequency = 30 * 1000;
  queue = "default";

  async run() {
    const users = await api.users.list();
    const posts = await api.users.postsList();
    log("*** STATUS ***", "info", {
      users: users.length,
      posts: posts.length,
    });
  }
}
