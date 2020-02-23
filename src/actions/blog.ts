import { api } from "actionhero";
import { AuthenticatedAction } from "./../classes/authenticatedAction";
import * as Blog from "./../modules/blog";

export class PostAdd extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "postAdd";
    this.description = "I add a post";
    this.outputExample = {};
    this.authenticated = true;
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      title: { required: true },
      content: { required: true }
    };
  }

  async run({ params }) {
    await Blog.postAdd(params.userName, params.title, params.content);
  }
}

export class PostView extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "postView";
    this.description = "I view a post";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {
      userName: { required: true },
      title: { required: true }
    };
  }

  async run({ response, params }) {
    response.post = await Blog.postView(params.userName, params.title);
  }
}

export class PostsList extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "postsList";
    this.description = "I list all of a user's posts";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {
      userName: { required: true }
    };
  }

  async run({ response, params }) {
    response.posts = await Blog.postsList(params.userName);
  }
}

export class PostEdit extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "postEdit";
    this.description = "I edit a post";
    this.outputExample = {};
    this.authenticated = true;
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      title: { required: true },
      content: { required: true }
    };
  }

  async run({ params }) {
    await Blog.postEdit(params.userName, params.title, params.content);
  }
}

export class PostDelete extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "postDelete";
    this.description = "I delete a post";
    this.outputExample = {};
    this.authenticated = true;
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      title: { required: true }
    };
  }

  async run({ params }) {
    await Blog.postDelete(params.userName, params.title);
  }
}

export class CommentAdd extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "commentAdd";
    this.description = "I add a comment";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {
      userName: { required: true },
      commenterName: { required: true },
      title: { required: true },
      comment: { required: true }
    };
  }

  async run({ params }) {
    await Blog.commentAdd(
      params.userName,
      params.title,
      params.commenterName,
      params.comment
    );
  }
}

export class CommentsView extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "commentsView";
    this.description = "I show all comments for a post";
    this.outputExample = {};
    this.authenticated = false;
    this.inputs = {
      userName: { required: true },
      title: { required: true }
    };
  }

  async run({ response, params }) {
    response.comments = await Blog.commentsView(params.userName, params.title);
  }
}

export class CommentDelete extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "commentDelete";
    this.description = "I delete a comment";
    this.outputExample = {};
    this.authenticated = true;
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      commentId: { required: true },
      title: { required: true }
    };
  }

  async run({ params }) {
    await Blog.commentDelete(params.userName, params.title, params.commentId);
  }
}
