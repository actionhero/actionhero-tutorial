const bcrypt = require('bcrypt')
const {Initializer, api} = require('actionhero')

module.exports = class Users extends Initializer {
  constructor () {
    super()
    this.name = 'users'
    this.saltRounds = 10
    this.redis = api.redis.clients.client
    this.usersHash = 'users'
  }

  async initialize () {
    api.users = {}

    api.users.add = async (userName, password) => {
      const savedUser = await this.redis.hget(this.usersHash, userName)
      if (savedUser) { throw new Error('userName already exists') }
      const hashedPassword = await api.users.cryptPassword(password)
      const data = {
        userName: userName,
        hashedPassword: hashedPassword,
        createdAt: new Date().getTime()
      }
      await this.redis.hset(this.usersHash, userName, JSON.stringify(data))
    }

    api.users.list = async () => {
      const userData = this.redis.hgetall(this.usersHash)
      return userData.map((u) => {
        let data = JSON.parse(u)
        delete data.hashedPassword
        return data
      })
    }

    api.users.authenticate = async (userName, password) => {
      try {
        let data = await this.redis.hget(this.usersHash, userName)
        data = JSON.parse(data)
        return api.users.comparePassword(data.hashedPassword, password)
      } catch (error) {
        throw new Error(`userName does not exist (${error})`)
      }
    }

    api.users.delete = async (userName, password) => {
      await this.redis.del(this.usersHash, userName)
      const titles = await api.blog.listUserPosts(userName)
      for (let i in titles) {
        await api.blog.deletePost(userName, titles[i])
      }
    }

    api.users.cryptPassword = async (password) => {
      return bcrypt.hash(password, this.saltRounds)
    }

    api.users.comparePassword = async (hashedPassword, userPassword) => {
      return bcrypt.compare(userPassword, hashedPassword)
    }
  }

  // async start () {}
  // async stop () {}
}
