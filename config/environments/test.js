// these variables overwrite settings in config.js for the 'test' environment

var config = {
  general: {
    id: "test-server-1",
    workers: 1,
    developmentMode: false
  },
  logger: { transports: null, },
  redis: {
    fake: true,
    host: "127.0.0.1",
    port: 6379,
    password: null,
    options: null,
    DB: 0,
  },
  servers: {
    web: {
      secure: false, 
      port: 9000,    
    },
  }
}

exports.config = config;