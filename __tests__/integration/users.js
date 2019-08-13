const request = require('request-promise-native')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()
let api
let url

describe('integration', () => {
  beforeAll(async () => {
    api = await actionhero.start()
    url = `http://localhost:${api.config.servers.web.port}/api`
  })

  beforeAll(async () => {
    try {
      await request.del(`${url}/user/evan`, { body: { password: 'password' }, json: true })
    } catch (error) {
      if (error.statusCode !== 400) { throw error }
    }

    try {
      await request.del(`${url}/user/someoneElse`, { body: { password: 'password' }, json: true })
    } catch (error) {
      if (error.statusCode !== 400) { throw error }
    }
  })

  afterAll(async () => { await actionhero.stop() })

  describe('users', () => {
    test('creates a user', async () => {
      const response = await request.post(`${url}/user`, { body: { userName: 'evan', password: 'password' }, json: true })
      expect(response.error).toBeUndefined()
    })

    test('prevents duplicate uesers from being created', async () => {
      try {
        await request.post(`${url}/user`, { body: { userName: 'evan', password: 'password' }, json: true })
        throw new Error('should not get here')
      } catch (error) {
        expect(error.statusCode).toEqual(400)
        expect(error.error.error).toEqual('userName already exists')
      }
    })

    test('authenticates with the propper password', async () => {
      const response = await request.post(`${url}/authenticate`, { body: { userName: 'evan', password: 'password' }, json: true })
      expect(response.authenticated).toEqual(true)
      expect(response.error).toBeUndefined()
    })

    test('does not authenticate with the propper password', async () => {
      try {
        await request.post(`${url}/authenticate`, { body: { userName: 'evan', password: 'xxx' }, json: true })
        throw new Error('should not get here')
      } catch (error) {
        expect(error.statusCode).toEqual(400)
        expect(error.error.authenticated).toEqual(false)
        expect(error.error.error).toEqual('unable to log in')
      }
    })

    test('returns a list of users', async () => {
      const response = await request.post(`${url}/user`, { body: { userName: 'someoneElse', password: 'password' }, json: true })
      expect(response.error).toBeUndefined()

      const usersResponse = await request.get(`${url}/usersList`, { json: true })
      expect(usersResponse.users.length).toBeGreaterThan(1)
      expect(usersResponse.users).toContain('evan')
      expect(usersResponse.users).toContain('someoneElse')
      expect(usersResponse.error).toBeUndefined()
    })
  })
})
