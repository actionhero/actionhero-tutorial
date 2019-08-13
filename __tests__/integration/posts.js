const request = require('request-promise-native')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()
let api
let url

describe('integration', () => {
  describe('posts', () => {
    beforeAll(async () => {
      api = await actionhero.start()
      url = `http://localhost:${api.config.servers.web.port}/api`
    })

    beforeAll(async () => {
      try {
        await request.del(`${url}/user/testPoster`, { body: { password: 'password' }, json: true })
      } catch (error) {
        if (error.statusCode !== 400) { throw error }
      }
    })

    beforeAll(async () => {
      await request.post(`${url}/user`, { body: { userName: 'testPoster', password: 'password' }, json: true })
    })

    afterAll(async () => { await actionhero.stop() })

    test('saves a post', async () => {
      const response = await request.post(`${url}/post/testPoster`, {
        json: true,
        body: {
          password: 'password',
          title: 'test post title',
          content: 'post content'
        }
      })

      expect(response.error).toBeUndefined()
    })

    test('views a post', async () => {
      const response = await request.get(`${url}/post/testPoster/${encodeURI('test post title')}`, { json: true })
      expect(response.post.title).toEqual('test post title')
      expect(response.post.content).toEqual('post content')
      expect(response.error).toBeUndefined()
    })

    test('lists posts by user', async () => {
      const response = await request.get(`${url}/posts/testPoster`, { json: true })
      expect(response.posts).toContain('test post title')
      expect(response.error).toBeUndefined()
    })

    test('does not mix posts for other users', async () => {
      const response = await request.get(`${url}/posts/someoneElse`, { json: true })
      expect(response.posts).not.toContain('test post title')
      expect(response.error).toBeUndefined()
    })
  })
})
