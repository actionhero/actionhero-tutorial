import { log, api, Task } from "actionhero";

export class Stats extends Task {
  constructor() {
    super();
    this.name = "stats task";
    this.description = "I report the stats";
    this.frequency = 30 * 1000;
    this.queue = "default";
  }

  async run() {
    const users = await api.users.list();
    const posts = await api.users.postsList();
    log("*** STATUS ***", "info", {
      users: users.length,
      posts: posts.length
    });
  }
}
