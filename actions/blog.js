exports.addPost = {
  name: "addPost",
  description: "I add a post",
  inputs: {
    required: ["userName", "password", "title", "content"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.addPost(connection.params.userName, connection.params.title, connection.params.content, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.viewPost = {
  name: "viewPost",
  description: "I view a post",
  inputs: {
    required: ["userName", "title"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.viewPost(connection.params.userName, connection.params.title, function(error, post){
      connection.error = error;
      connection.response.post = post;
      next(connection, true);
    });
  }
};

exports.listUserPosts = {
  name: "listUserPosts",
  description: "I list all of a user's posts",
  inputs: {
    required: ["userName"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.listUserPosts(connection.params.userName, function(error, posts){
      connection.error = error;
      connection.response.posts = posts;
      next(connection, true);
    });
  }
};

exports.editPost = {
  name: "editPost",
  description: "I edit a post",
  inputs: {
    required: ["userName", "password", "title", "content"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.editPost(connection.params.userName, connection.params.title, connection.params.content, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.deletePost = {
  name: "deletePost",
  description: "I delete a post",
  inputs: {
    required: ["userName", "password", "title"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.deletePost(connection.params.userName, connection.params.title, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.addComment = {
  name: "addComment",
  description: "I add a comment",
  inputs: {
    required: ["userName", "title", "commenterName", "comment"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.addComment(connection.params.userName, connection.params.title, connection.params.commenterName, connection.params.comment, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.viewComments = {
  name: "viewComments",
  description: "I show all comments for a post",
  inputs: {
    required: ["userName", "title"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.viewComments(connection.params.userName, connection.params.title, function(error, comments){
      connection.error = error;
      connection.response.comments = comments;
      next(connection, true);
    });
  }
};

exports.deleteComment = {
  name: "deleteComment",
  description: "I add a comment",
  inputs: {
    required: ["userName", "password", "commentId", "title"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.deleteComment(connection.params.userName, connection.params.title, connection.params.commentId, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};