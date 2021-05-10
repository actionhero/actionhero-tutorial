import * as bcrypt from "bcrypt";
import { api } from "actionhero";

const saltRounds = 10;
const usersHash = "users";

export async function add(userName: string, password: string) {
  const savedUser = await redis().hget(usersHash, userName);
  if (savedUser) {
    throw new Error("userName already exists");
  }
  const hashedPassword = await cryptPassword(password);
  const data = {
    userName: userName,
    hashedPassword: hashedPassword,
    createdAt: new Date().getTime(),
  };

  await redis().hset(usersHash, userName, JSON.stringify(data));
}

export async function list() {
  const userData = await redis().hgetall(usersHash);
  return Object.keys(userData).map((k) => {
    const data = JSON.parse(userData[k]);
    delete data.hashedPassword;
    return data;
  });
}

export async function authenticate(
  userName: string,
  password: string
): Promise<boolean> {
  try {
    const dataString = await redis().hget(usersHash, userName);
    const data = JSON.parse(dataString);
    if (!data.hashedPassword) throw new Error();
    return comparePassword(data?.hashedPassword, password);
  } catch (error) {
    throw new Error(`userName does not exist (${error})`);
  }
}

export async function del(userName: string) {
  await redis().del(usersHash, userName);
  const titles = await api.blog.postsList(userName);
  for (const i in titles) {
    await api.blog.deletePost(userName, titles[i]);
  }
}

async function cryptPassword(password: string) {
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(hashedPassword: string, userPassword: string) {
  return bcrypt.compare(userPassword, hashedPassword);
}

function redis() {
  return api.redis.clients.client;
}
