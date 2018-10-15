const { api, Action } = require('actionhero')

exports.postAdd = class PostAdd extends Action {
  constructor () {
    super()
    this.name = 'postAdd'
    this.description = 'I add a post'
    this.outputExample = {}
    this.authenticated = true
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      title: { required: true },
      content: { required: true }
    }
  }

  async run ({ params }) {
    await api.blog.postAdd(params.userName, params.title, params.content)
  }
}

exports.postView = class PostView extends Action {
  constructor () {
    super()
    this.name = 'postView'
    this.description = 'I view a post'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {
      userName: { required: true },
      title: { required: true }
    }
  }

  async run ({ response, params }) {
    response.post = await api.blog.postView(params.userName, params.title)
  }
}

exports.postsList = class PostsList extends Action {
  constructor () {
    super()
    this.name = 'postsList'
    this.description = 'I list all of a user\'s posts'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {
      userName: { required: true }
    }
  }

  async run ({ response, params }) {
    response.posts = await api.blog.postsList(params.userName)
  }
}

exports.postEdit = class PostEdit extends Action {
  constructor () {
    super()
    this.name = 'postEdit'
    this.description = 'I edit a post'
    this.outputExample = {}
    this.authenticated = true
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      title: { required: true },
      content: { required: true }
    }
  }

  async run ({ params }) {
    await api.blog.postEdit(params.userName, params.title, params.content)
  }
}

exports.postDelete = class PostDelete extends Action {
  constructor () {
    super()
    this.name = 'postDelete'
    this.description = 'I delete a post'
    this.outputExample = {}
    this.authenticated = true
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      title: { required: true }
    }
  }

  async run ({ params }) {
    await api.blog.postDelete(params.userName, params.title)
  }
}

exports.commentAdd = class CommentAdd extends Action {
  constructor () {
    super()
    this.name = 'commentAdd'
    this.description = 'I add a comment'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {
      userName: { required: true },
      commenterName: { required: true },
      title: { required: true },
      comment: { required: true }
    }
  }

  async run ({ params }) {
    await api.blog.commentAdd(params.userName, params.title, params.commenterName, params.comment)
  }
}

exports.commentsView = class CommentsView extends Action {
  constructor () {
    super()
    this.name = 'commentsView'
    this.description = 'I show all comments for a post'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {
      userName: { required: true },
      title: { required: true }
    }
  }

  async run ({ response, params }) {
    response.comments = await api.blog.commentsView(params.userName, params.title)
  }
}

exports.commentDelete = class CommentDelete extends Action {
  constructor () {
    super()
    this.name = 'commentDelete'
    this.description = 'I delete a comment'
    this.outputExample = {}
    this.authenticated = true
    this.inputs = {
      userName: { required: true },
      password: { required: true },
      commentId: { required: true },
      title: { required: true }
    }
  }

  async run ({ params }) {
    await api.blog.commentDelete(params.userName, params.title, params.commentId)
  }
}
