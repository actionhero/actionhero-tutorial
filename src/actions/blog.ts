import { ParamsFrom } from "actionhero";
import { AuthenticatedAction } from "./../classes/authenticatedAction";
import * as Blog from "./../modules/blog";

export class PostAdd extends AuthenticatedAction {
  name = "postAdd";
  description = "I add a post";
  outputExample = {};
  authenticated = true;
  inputs = {
    userName: { required: true },
    password: { required: true },
    title: { required: true },
    content: { required: true },
  };

  async run({ params }: { params: ParamsFrom<PostAdd> }) {
    await Blog.postAdd(params.userName, params.title, params.content);
    const post = await Blog.postView(params.userName, params.title);
    return { post };
  }
}

export class PostView extends AuthenticatedAction {
  name = "postView";
  description = "I view a post";
  outputExample = {};
  authenticated = false;
  inputs = {
    userName: { required: true },
    title: { required: true },
  };

  async run({ params }: { params: ParamsFrom<PostView> }) {
    const post = await Blog.postView(params.userName, params.title);
    return { post };
  }
}

export class PostsList extends AuthenticatedAction {
  name = "postsList";
  description = "I list all of a user's posts";
  outputExample = {};
  authenticated = false;
  inputs = {
    userName: { required: true },
  };

  async run({ params }: { params: ParamsFrom<PostsList> }) {
    const posts = await Blog.postsList(params.userName);
    return { posts };
  }
}

export class PostEdit extends AuthenticatedAction {
  name = "postEdit";
  description = "I edit a post";
  outputExample = {};
  authenticated = true;
  inputs = {
    userName: { required: true },
    password: { required: true },
    title: { required: true },
    content: { required: true },
  };

  async run({ params }: { params: ParamsFrom<PostEdit> }) {
    await Blog.postEdit(params.userName, params.title, params.content);
    return { success: true };
  }
}

export class PostDelete extends AuthenticatedAction {
  name = "postDelete";
  description = "I delete a post";
  outputExample = {};
  authenticated = true;
  inputs = {
    userName: { required: true },
    password: { required: true },
    title: { required: true },
  };

  async run({ params }: { params: ParamsFrom<PostDelete> }) {
    await Blog.postDelete(params.userName, params.title);
  }
}

export class CommentAdd extends AuthenticatedAction {
  name = "commentAdd";
  description = "I add a comment";
  outputExample = {};
  authenticated = false;
  inputs = {
    userName: { required: true },
    commenterName: { required: true },
    title: { required: true },
    comment: { required: true },
  };

  async run({ params }: { params: ParamsFrom<CommentAdd> }) {
    await Blog.commentAdd(
      params.userName,
      params.title,
      params.commenterName,
      params.comment
    );
    return { success: true };
  }
}

export class CommentsView extends AuthenticatedAction {
  name = "commentsView";
  description = "I show all comments for a post";
  outputExample = {};
  authenticated = false;
  inputs = {
    userName: { required: true },
    title: { required: true },
  };

  async run({ params }: { params: ParamsFrom<CommentsView> }) {
    const comments = await Blog.commentsView(params.userName, params.title);
    return { comments };
  }
}

export class CommentDelete extends AuthenticatedAction {
  name = "commentDelete";
  description = "I delete a comment";
  outputExample = {};
  authenticated = true;
  inputs = {
    userName: { required: true },
    password: { required: true },
    commentId: { required: true },
    title: { required: true },
  };

  async run({ params }: { params: ParamsFrom<CommentDelete> }) {
    await Blog.commentDelete(params.userName, params.title, params.commentId);
    return { success: true };
  }
}
