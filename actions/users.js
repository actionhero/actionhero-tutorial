exports.userAdd = {
  name: 'userAdd',
  description: 'I add a user',
  inputs: {
    userName: {required: true},
    password: {required: true}
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.users.add(data.params.userName, data.params.password, function (error) {
      next(error)
    })
  }
}

exports.userDelete = {
  name: 'userDelete',
  description: 'I delete a user',
  inputs: {
    userName: {required: true},
    password: {required: true}
  },
  authenticated: true,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.users.delete(data.params.userName, data.params.password, function (error) {
      next(error)
    })
  }
}

exports.usersList = {
  name: 'usersList',
  description: 'I list all the users',
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.users.list(function (error, users) {
      data.response.users = []
      for (var i in users) {
        data.response.users.push(users[i].userName)
      }
      next(error)
    })
  }
}

exports.authenticate = {
  name: 'authenticate',
  description: 'I authenticate a user',
  inputs: {
    userName: {required: true},
    password: {required: true}
  },
  authenticated: false,
  outputExample: {},
  version: 1.0,
  run: function (api, data, next) {
    api.users.authenticate(data.params.userName, data.params.password, function (error, match) {
      data.response.authenticated = match
      if (match === false && !error) {
        error = new Error('unable to log in')
      }
      next(error)
    })
  }
}
