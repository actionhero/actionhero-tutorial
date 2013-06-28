exports._setup = {
  serverPrototype: require("../node_modules/actionHero/actionHero.js").actionHeroPrototype,
  testUrl:         "http://127.0.0.1:9000/api",
  
  serverConfigChanges: {
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
  },

  init: function(callback){
    var self = this;
    if(self.server == null){
      self.server = new self.serverPrototype();
      self.server.start({configChanges: self.serverConfigChanges}, function(err, api){
        self.api = api;
        callback();
      });
    }else{
      self.server.restart(function(){
        callback();
      });
    }
  }

}