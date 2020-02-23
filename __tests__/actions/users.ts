import { Process, api, specHelper } from "actionhero";
const actionhero = new Process();

describe("actionhero Tests", () => {
  beforeAll(async () => {
    await actionhero.start();
    await api.redis.clients.client.flushdb();
  });

  afterAll(async () => {
    await actionhero.stop();
  });

  test("can create a user", async () => {
    const response = await specHelper.runAction("userAdd", {
      userName: "evan",
      password: "password"
    });
    expect(response.error).toBeUndefined();
  });

  test("cannot create a user with an existing name", async () => {
    const response = await specHelper.runAction("userAdd", {
      userName: "evan",
      password: "password"
    });

    expect(response.error).toMatch(/userName already exists/);
  });
});
