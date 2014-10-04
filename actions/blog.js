exports.postAdd = {
  name: "postAdd",
  description: "I add a post",
  inputs: {
    required: ["userName", "password", "title", "content"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postAdd(connection.params.userName, connection.params.title, connection.params.content, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.postView = {
  name: "postView",
  description: "I view a post",
  inputs: {
    required: ["userName", "title"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postView(connection.params.userName, connection.params.title, function(error, post){
      connection.error = error;
      connection.response.post = post;
      next(connection, true);
    });
  }
};

exports.postsList = {
  name: "postsList",
  description: "I list all of a user's posts",
  inputs: {
    required: ["userName"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postsList(connection.params.userName, function(error, posts){
      connection.error = error;
      connection.response.posts = posts;
      next(connection, true);
    });
  }
};

exports.postEdit = {
  name: "postEdit",
  description: "I edit a post",
  inputs: {
    required: ["userName", "password", "title", "content"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postEdit(connection.params.userName, connection.params.title, connection.params.content, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.postDelete = {
  name: "postDelete",
  description: "I delete a post",
  inputs: {
    required: ["userName", "password", "title"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.postDelete(connection.params.userName, connection.params.title, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.commentAdd = {
  name: "commentAdd",
  description: "I add a comment",
  inputs: {
    required: ["userName", "title", "commenterName", "comment"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.commentAdd(connection.params.userName, connection.params.title, connection.params.commenterName, connection.params.comment, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};

exports.commentsView = {
  name: "commentsView",
  description: "I show all comments for a post",
  inputs: {
    required: ["userName", "title"],
    optional: [],
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.commentsView(connection.params.userName, connection.params.title, function(error, comments){
      connection.error = error;
      connection.response.comments = comments;
      next(connection, true);
    });
  }
};

exports.commentDelete = {
  name: "commentDelete",
  description: "I delete a comment",
  inputs: {
    required: ["userName", "password", "commentId", "title"],
    optional: [],
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function(api, connection, next){
    api.blog.commentDelete(connection.params.userName, connection.params.title, connection.params.commentId, function(error){
      connection.error = error;
      next(connection, true);
    });
  }
};
