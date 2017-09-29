const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const r2 = require('r2')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()
let api
let url

describe('integration', () => {
  before(async () => {
    api = await actionhero.start()
    url = `http://localhost:${api.config.servers.web.port}/api`
  })

  after(async () => { await actionhero.stop() })

  describe('users', () => {
    it('creates a user', async () => {
      const body = await r2.post(`${url}/user`, {json: {userName: 'evan', password: 'password'}}).json
      expect(body.error).to.not.exist()
    })

    it('prevents duplicate uesers from being created', async () => {
      const body = await r2.post(`${url}/user`, {json: {userName: 'evan', password: 'password'}}).json
      expect(body.error).to.equal('userName already exists')
    })

    it('authenticates with the propper password', async () => {
      const body = await r2.post(`${url}/authenticate`, {json: {userName: 'evan', password: 'password'}}).json
      expect(body.authenticated).to.equal(true)
      expect(body.error).to.not.exist()
    })

    it('does not authenticate with the propper password', async () => {
      const body = await r2.post(`${url}/authenticate`, {json: {userName: 'evan', password: 'xxx'}}).json
      expect(body.authenticated).to.equal(false)
      expect(body.error).to.equal('unable to log in')
    })

    it('returns a list of users', async () => {
      const body = await r2.post(`${url}/user`, {json: {userName: 'someoneElse', password: 'password'}}).json
      expect(body.error).to.not.exist()

      const usersBody = await r2.get(`${url}/usersList`).json
      expect(usersBody.users.length).to.be.above(1)
      expect(usersBody.users).to.include('evan')
      expect(usersBody.users).to.include('someoneElse')
      expect(usersBody.error).to.not.exist()
    })
  })
})
