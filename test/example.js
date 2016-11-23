process.env.NODE_ENV = 'test'

var should = require('should')
var ActionheroPrototype = require('actionhero')
var actionhero = new ActionheroPrototype()
var api

describe('actionhero Tests', function () {
  before(function (done) {
    actionhero.start(function (error, a) {
      if (error) { return done(error) }
      api = a
      done()
    })
  })

  after(function (done) {
    actionhero.stop(function (error) {
      if (error) { return done(error) }
      done()
    })
  })

  it('should have booted into the test env', function () {
    process.env.NODE_ENV.should.equal('test')
    api.env.should.equal('test')
    should.exist(api.id)
  })
})
