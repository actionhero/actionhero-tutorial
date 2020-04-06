import axios from "axios";
import { Process, config, api } from "actionhero";
const actionhero = new Process();
let url;

describe("integration", () => {
  beforeAll(async () => {
    await actionhero.start();
    url = `http://localhost:${config.servers.web.port}/api`;
  });

  beforeAll(async () => {
    await api.redis.clients.client.flushdb();
  });

  afterAll(async () => {
    await actionhero.stop();
  });

  describe("users", () => {
    test("creates a user", async () => {
      const response = await axios.post(`${url}/user`, {
        userName: "evan",
        password: "password",
      });

      expect(response.data.error).toBeUndefined();
    });

    test("prevents duplicate users from being created", async () => {
      try {
        await axios.post(`${url}/user`, {
          userName: "evan",
          password: "password",
        });
        throw new Error("should not get here");
      } catch (error) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data.error).toEqual("userName already exists");
      }
    });

    test("authenticates with the correct password", async () => {
      const response = await axios.post(`${url}/authenticate`, {
        userName: "evan",
        password: "password",
      });
      expect(response.data.authenticated).toEqual(true);
      expect(response.data.error).toBeUndefined();
    });

    test("does not authenticate with the correct password", async () => {
      try {
        await axios.post(`${url}/authenticate`, {
          userName: "evan",
          password: "xxx",
        });
        throw new Error("should not get here");
      } catch (error) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data.authenticated).toEqual(false);
        expect(error.response.data.error).toEqual("unable to log in");
      }
    });

    test("returns a list of users", async () => {
      const response = await axios.post(`${url}/user`, {
        userName: "someoneElse",
        password: "password",
      });
      expect(response.data.error).toBeUndefined();

      const usersResponse = await axios.get(`${url}/usersList`);
      expect(usersResponse.data.users.length).toBeGreaterThan(1);
      expect(usersResponse.data.users).toContain("evan");
      expect(usersResponse.data.users).toContain("someoneElse");
      expect(usersResponse.data.error).toBeUndefined();
    });
  });
});
