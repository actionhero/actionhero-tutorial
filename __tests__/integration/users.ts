import axios from "axios";
import { Process, config, api } from "actionhero";
const actionhero = new Process();
let url: string;

describe("integration", () => {
  beforeAll(async () => {
    await actionhero.start();
    url = `http://${config.web.bindIP}:${config.web.port}/api`;
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

      expect((response.data as Record<string, any>).error).toBeUndefined();
    });

    test("prevents duplicate users from being created", async () => {
      try {
        await axios.post(`${url}/user`, {
          userName: "evan",
          password: "password",
        });
        throw new Error("should not get here");
      } catch (error) {
        expect(error.response.status).toEqual(500);
        expect(error.response.data.error).toEqual("userName already exists");
      }
    });

    test("authenticates with the correct password", async () => {
      const response = await axios.post(`${url}/authenticate`, {
        userName: "evan",
        password: "password",
      });
      expect((response.data as Record<string, any>).authenticated).toEqual(
        true
      );
      expect((response.data as Record<string, any>).error).toBeUndefined();
    });

    test("does not authenticate with the correct password", async () => {
      try {
        await axios.post(`${url}/authenticate`, {
          userName: "evan",
          password: "xxx",
        });
        throw new Error("should not get here");
      } catch (error) {
        expect(error.response.status).toEqual(500);
        expect(error.response.data.authenticated).toBeUndefined();
        expect(error.response.data.error).toEqual("unable to log in");
      }
    });

    test("returns a list of users", async () => {
      const response = await axios.post(`${url}/user`, {
        userName: "someoneElse",
        password: "password",
      });
      expect((response.data as Record<string, any>).error).toBeUndefined();

      const usersResponse = await axios.get(`${url}/users`);
      expect(
        (usersResponse.data as Record<string, any>).users.length
      ).toBeGreaterThan(1);
      expect((usersResponse.data as Record<string, any>).users).toContain(
        "evan"
      );
      expect((usersResponse.data as Record<string, any>).users).toContain(
        "someoneElse"
      );
      expect((usersResponse.data as Record<string, any>).error).toBeUndefined();
    });
  });
});
