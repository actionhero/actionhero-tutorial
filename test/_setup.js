exports._setup = {
  ServerPrototype: require('../node_modules/actionhero/actionhero.js'),
  testUrl: 'http://127.0.0.1:8081/api',

  init: function (callback) {
    var self = this
    if (!self.server) {
      console.log('    starting test server...')
      self.server = new self.ServerPrototype()
      self.server.start(function (error, api) {
        if (error) { return callback(error) }
        self.api = api
        callback()
      })
    } else {
      console.log('    restarting test server...')
      self.server.restart(function () {
        callback()
      })
    }
  }

}
