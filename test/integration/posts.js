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
  describe('posts', () => {
    before(async () => {
      api = await actionhero.start()
      url = `http://localhost:${api.config.servers.web.port}/api`

      const body = await r2.post(`${url}/user`, {json: {userName: 'testPoster', password: 'password'}}).json
      expect(body.error).not.to.exist()
    })

    after(async () => { await actionhero.stop() })

    it('saves a post', async () => {
      const body = await r2.post(`${url}/post/testPoster`, {json: {
        password: 'password',
        title: 'test post title',
        content: 'post content'
      }}).json

      expect(body.error).not.to.exist()
    })

    it('views a post', async () => {
      const body = await r2.get(`${url}/post/testPoster/${encodeURI('test post title')}`).json
      expect(body.post.title).to.equal('test post title')
      expect(body.post.content).to.equal('post content')
      expect(body.error).not.to.exist()
    })

    it('lists posts by user', async () => {
      const body = await r2.get(`${url}/posts/testPoster`).json
      expect(body.posts).to.include('test post title')
      expect(body.error).not.to.exist()
    })

    it('does not mix posts for other users', async () => {
      const body = await r2.get(`${url}/posts/someoneElse`).json
      expect(body.posts).not.to.include('test post title')
      expect(body.error).not.to.exist()
    })
  })
})
