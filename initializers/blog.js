const {Initializer, api} = require('actionhero')

module.exports = class Blog extends Initializer {
  constructor () {
    super()
    this.name = 'blog'
    this.redis = api.redis.clients.client
  }

  async initialize () {
    api.blog = {
      separator: ';',
      postPrefix: 'posts',
      commentPrefix: 'comments:'
    }

    api.blog.postAdd = async (userName, title, content) => {
      const key = this.buildTitleKey(userName, title)
      const data = {
        content: content,
        title: title,
        userName: userName,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }
      await this.redis.hmset(key, data)
    }

    api.blog.postView = async (userName, title) => {
      const key = this.buildTitleKey(userName, title)
      await this.redis.hgetall(key)
    }

    api.blog.postsList = async (userName) => {
      const search = [api.blog.postPrefix, userName, '*'].join(api.blog.separator)
      const keys = await this.redis.keys(search)
      let titles = keys.map((key) => {
        let parts = key.split(api.blog.separator)
        return parts[(parts.length - 1)]
      })

      titles.sort()
      return titles
    }

    api.blog.postEdit = async (userName, title, content) => {
      const key = this.buildTitleKey(userName, title)
      const data = await this.viewPost(key)
      const newData = {
        content: content,
        title: title,
        userName: userName,
        createdAt: data.createdAt,
        updatedAt: new Date().getTime()
      }
      await this.redis.hmset(key, newData)
    }

    api.blog.postDelete = async (userName, title) => {
      const key = this.buildTitleKey(userName, title)
      await this.redis.del(key)
      const commentKey = this.buildCommentKey(userName, title)
      await this.redis.del(commentKey)
    }

    api.blog.commentAdd = async (userName, title, commenterName, comment) => {
      const key = this.buildCommentKey(userName, title)
      const commentId = this.buildCommentId(commenterName)
      const data = {
        comment: comment,
        createdAt: new Date().getTime(),
        commentId: commentId
      }
      await this.redis.hset(key, commentId, JSON.stringify(data))
    }

    api.blog.commentsView = async (userName, title) => {
      const key = this.buildCommentKey(userName, title)
      const data = await this.redis.hgetall(key)
      const comments = data.map((item) => { return JSON.parse(item) })
      return comments
    }

    api.blog.commentDelete = async (userName, title, commentId) => {
      const key = this.buildCommentKey(userName, title)
      await this.redis.hdel(key, commentId)
    }

    api.blog.buildTitleKey = (userName, title) => {
      // "posts:evan:my first post"
      return api.blog.postPrefix + api.blog.separator + userName + api.blog.separator + title
    }

    api.blog.buildCommentKey = (userName, title) => {
      // "comments:evan:my first post"
      return api.blog.commentPrefix + api.blog.separator + userName + api.blog.separator + title
    }

    api.blog.buildCommentId = (commenterName) => {
      return commenterName + new Date().getTime()
    }
  }

  // async start () {}
  // async stop () {}
}
