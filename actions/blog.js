exports.postAdd = {
  name: 'postAdd',
  description: 'I add a post',
  inputs: {
    userName: {required: true},
    password: {required: true},
    title: {required: true},
    content: {required: true}
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.postAdd(data.params.userName, data.params.title, data.params.content, function (error) {
      next(error)
    })
  }
}

exports.postView = {
  name: 'postView',
  description: 'I view a post',
  inputs: {
    userName: {required: true},
    title: {required: true}
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.postView(data.params.userName, data.params.title, function (error, post) {
      data.response.post = post
      next(error)
    })
  }
}

exports.postsList = {
  name: 'postsList',
  description: "I list all of a user's posts",
  inputs: {
    userName: {required: true}
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.postsList(data.params.userName, function (error, posts) {
      data.response.posts = posts
      next(error)
    })
  }
}

exports.postEdit = {
  name: 'postEdit',
  description: 'I edit a post',
  inputs: {
    userName: {required: true},
    password: {required: true},
    title: {required: true},
    content: {required: true}
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.postEdit(data.params.userName, data.params.title, data.params.content, function (error) {
      next(error)
    })
  }
}

exports.postDelete = {
  name: 'postDelete',
  description: 'I delete a post',
  inputs: {
    userName: {required: true},
    password: {required: true},
    title: {required: true}
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.postDelete(data.params.userName, data.params.title, function (error) {
      next(error)
    })
  }
}

exports.commentAdd = {
  name: 'commentAdd',
  description: 'I add a comment',
  inputs: {
    userName: {required: true},
    commenterName: {required: true},
    title: {required: true},
    comment: {required: true}
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.commentAdd(data.params.userName, data.params.title, data.params.commenterName, data.params.comment, function (error) {
      next(error)
    })
  }
}

exports.commentsView = {
  name: 'commentsView',
  description: 'I show all comments for a post',
  inputs: {
    userName: {required: true},
    title: {required: true}
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.commentsView(data.params.userName, data.params.title, function (error, comments) {
      data.response.comments = comments
      next(error)
    })
  }
}

exports.commentDelete = {
  name: 'commentDelete',
  description: 'I delete a comment',
  inputs: {
    userName: {required: true},
    password: {required: true},
    commentId: {required: true},
    title: {required: true}
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.blog.commentDelete(data.params.userName, data.params.title, data.params.commentId, function (error) {
      next(error)
    })
  }
}
