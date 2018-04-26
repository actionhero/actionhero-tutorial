const r2 = require('r2')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()
let api
let url

describe('integration', () => {
  describe('posts', () => {
    beforeAll(async () => {
      api = await actionhero.start()
      url = `http://localhost:${api.config.servers.web.port}/api`

      const body = await r2.post(`${url}/user`, {json: {userName: 'testPoster', password: 'password'}}).json
      expect(body.error).toBeUndefined()
    })

    afterAll(async () => { await actionhero.stop() })

    test('saves a post', async () => {
      const body = await r2.post(`${url}/post/testPoster`, {json: {
        password: 'password',
        title: 'test post title',
        content: 'post content'
      }}).json

      expect(body.error).toBeUndefined()
    })

    test('views a post', async () => {
      const body = await r2.get(`${url}/post/testPoster/${encodeURI('test post title')}`).json
      expect(body.post.title).toEqual('test post title')
      expect(body.post.content).toEqual('post content')
      expect(body.error).toBeUndefined()
    })

    test('lists posts by user', async () => {
      const body = await r2.get(`${url}/posts/testPoster`).json
      expect(body.posts).toContain('test post title')
      expect(body.error).toBeUndefined()
    })

    test('does not mix posts for other users', async () => {
      const body = await r2.get(`${url}/posts/someoneElse`).json
      expect(body.posts).not.toContain('test post title')
      expect(body.error).toBeUndefined()
    })
  })
})
