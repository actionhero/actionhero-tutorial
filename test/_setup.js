exports._setup = {
  serverPrototype: require("../node_modules/actionhero/actionhero.js").actionheroPrototype,
  testUrl:         "http://127.0.0.1:9000/api",
  
  init: function(callback){
    var self = this;
    if(self.server == null){
      self.server = new self.serverPrototype();
      self.server.start(function(err, api){
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