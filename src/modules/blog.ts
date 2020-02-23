import { api } from "actionhero";

const separator = ";";
const postPrefix = "posts";
const commentPrefix = "comments:";

export async function postAdd(
  userName: string,
  title: string,
  content: string
) {
  const key = buildTitleKey(userName, title);
  const data = {
    content,
    title,
    userName,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  };
  await redis().hmset(key, data);
}

export async function postView(userName: string, title?: string) {
  const key = buildTitleKey(userName, title);
  return redis().hgetall(key);
}

export async function postsList(userName: string) {
  const search = [postPrefix, userName, "*"].join(separator);
  const keys = await redis().keys(search);
  const titles = keys.map(key => {
    const parts = key.split(separator);
    return parts[parts.length - 1];
  });

  titles.sort();
  return titles;
}

export async function postEdit(
  userName: string,
  title: string,
  content: string
) {
  const key = buildTitleKey(userName, title);
  const data = await postView(key);
  const newData = {
    content,
    title,
    userName,
    createdAt: data.createdAt,
    updatedAt: new Date().getTime()
  };
  await redis().hmset(key, newData);
}

export async function postDelete(userName: string, title: string) {
  const key = buildTitleKey(userName, title);
  await redis().del(key);
  const commentKey = buildCommentKey(userName, title);
  await redis().del(commentKey);
}

export async function commentAdd(
  userName: string,
  title: string,
  commenterName: string,
  comment: string
) {
  const key = buildCommentKey(userName, title);
  const commentId = buildCommentId(commenterName);
  const data = {
    comment,
    commenterName,
    createdAt: new Date().getTime(),
    commentId: commentId
  };
  await redis().hset(key, commentId, JSON.stringify(data));
}

export async function commentsView(userName: string, title: string) {
  const key = buildCommentKey(userName, title);
  const data = await redis().hgetall(key);
  const comments = Object.keys(data).map(key => {
    const comment = data[key];
    return JSON.parse(comment);
  });
  return comments;
}

export async function commentDelete(
  userName: string,
  title: string,
  commentId: string
) {
  const key = buildCommentKey(userName, title);
  await redis().hdel(key, commentId);
}

function buildTitleKey(userName: string, title = "") {
  // "posts:evan:my first post"
  return postPrefix + separator + userName + separator + title;
}

function buildCommentKey(userName: string, title: string) {
  // "comments:evan:my first post"
  return commentPrefix + separator + userName + separator + title;
}

function buildCommentId(commenterName: string) {
  return commenterName + new Date().getTime();
}

function redis() {
  return api.redis.clients.client;
}
