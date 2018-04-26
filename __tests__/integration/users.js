const r2 = require('r2')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()
let api
let url

describe('integration', () => {
  beforeAll(async () => {
    api = await actionhero.start()
    url = `http://localhost:${api.config.servers.web.port}/api`
  })

  afterAll(async () => { await actionhero.stop() })

  describe('users', () => {
    test('creates a user', async () => {
      const body = await r2.post(`${url}/user`, {json: {userName: 'evan', password: 'password'}}).json
      expect(body.error).toBeUndefined()
    })

    test('prevents duplicate uesers from being created', async () => {
      const body = await r2.post(`${url}/user`, {json: {userName: 'evan', password: 'password'}}).json
      expect(body.error).toEqual('userName already exists')
    })

    test('authenticates with the propper password', async () => {
      const body = await r2.post(`${url}/authenticate`, {json: {userName: 'evan', password: 'password'}}).json
      expect(body.authenticated).toEqual(true)
      expect(body.error).toBeUndefined()
    })

    test('does not authenticate with the propper password', async () => {
      const body = await r2.post(`${url}/authenticate`, {json: {userName: 'evan', password: 'xxx'}}).json
      expect(body.authenticated).toEqual(false)
      expect(body.error).toEqual('unable to log in')
    })

    test('returns a list of users', async () => {
      const body = await r2.post(`${url}/user`, {json: {userName: 'someoneElse', password: 'password'}}).json
      expect(body.error).toBeUndefined()

      const usersBody = await r2.get(`${url}/usersList`).json
      expect(usersBody.users.length).toBeGreaterThan(1)
      expect(usersBody.users).toContain('evan')
      expect(usersBody.users).toContain('someoneElse')
      expect(usersBody.error).toBeUndefined()
    })
  })
})
