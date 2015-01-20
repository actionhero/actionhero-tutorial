exports.task = {
  name: "stats",
  description: "stats",
  frequency: 30 * 1000,
  queue: "default",
  plugins:       [],
  pluginOptions: [],

  run: function(api, params, next){
    var error = null;    
    var redis = api.redis.client;
    var users = [];
    var posts = [];
    var started = 0;

    var render = function(){
      api.log("*** STATUS ***");
      api.log(users.length + " users");
      api.log(posts.length + " posts");
      api.log("**************");
      next();
    };

    api.users.list(function(error, u){
      users = u;
      if(users.length === 0){
        render();
      }else{
        users.forEach(function(user){
          started++;
          api.blog.postsList(user.userName, function(error, p){
            p.forEach(function(post){
              posts.push(post);
            });
            started--;
            if(started === 0){ render(); }
          });
        });
      }
    });
  }
};
