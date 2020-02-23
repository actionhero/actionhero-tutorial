import axios from "axios";
import { Process, config, api } from "actionhero";
const actionhero = new Process();
let url;

describe("integration", () => {
  describe("posts", () => {
    beforeAll(async () => {
      await actionhero.start();
      url = `http://localhost:${config.servers.web.port}/api`;
    });

    beforeAll(async () => {
      await api.redis.clients.client.flushdb();

      await axios.post(`${url}/user`, {
        userName: "testPoster",
        password: "password"
      });
    });

    afterAll(async () => {
      await actionhero.stop();
    });

    test("saves a post", async () => {
      const response = await axios.post(`${url}/post/testPoster`, {
        password: "password",
        title: "test post title",
        content: "post content"
      });

      expect(response.data.error).toBeUndefined();
    });

    test("views a post", async () => {
      const response = await axios.get(
        `${url}/post/testPoster/${encodeURI("test post title")}`
      );
      expect(response.data.post.title).toEqual("test post title");
      expect(response.data.post.content).toEqual("post content");
      expect(response.data.error).toBeUndefined();
    });

    test("lists posts by user", async () => {
      const response = await axios.get(`${url}/posts/testPoster`);
      expect(response.data.posts).toContain("test post title");
      expect(response.data.error).toBeUndefined();
    });

    test("does not mix posts for other users", async () => {
      const response = await axios.get(`${url}/posts/someoneElse`);
      expect(response.data.posts).not.toContain("test post title");
      expect(response.data.error).toBeUndefined();
    });
  });
});
