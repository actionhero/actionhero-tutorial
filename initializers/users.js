const bcrypt = require('bcrypt')
const { Initializer, api } = require('actionhero')

module.exports = class Users extends Initializer {
  constructor () {
    super()
    this.name = 'users'
    this.saltRounds = 10
    this.usersHash = 'users'
  }

  async initialize () {
    const redis = api.redis.clients.client

    api.users = {}

    api.users.add = async (userName, password) => {
      const savedUser = await redis.hget(this.usersHash, userName)
      if (savedUser) { throw new Error('userName already exists') }
      const hashedPassword = await api.users.cryptPassword(password)
      const data = {
        userName: userName,
        hashedPassword: hashedPassword,
        createdAt: new Date().getTime()
      }

      await redis.hset(this.usersHash, userName, JSON.stringify(data))
    }

    api.users.list = async () => {
      const userData = await redis.hgetall(this.usersHash)
      return Object.keys(userData).map((k) => {
        const data = JSON.parse(userData[k])
        delete data.hashedPassword
        return data
      })
    }

    api.users.authenticate = async (userName, password) => {
      try {
        let data = await redis.hget(this.usersHash, userName)
        data = JSON.parse(data)
        return api.users.comparePassword(data.hashedPassword, password)
      } catch (error) {
        throw new Error(`userName does not exist (${error})`)
      }
    }

    api.users.delete = async (userName, password) => {
      await redis.del(this.usersHash, userName)
      const titles = await api.blog.postsList(userName)
      for (const i in titles) {
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
