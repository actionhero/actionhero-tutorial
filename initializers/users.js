// initializers/users.js
var bcrypt = require('bcrypt');

exports.users = function(api, next){
  var redis = api.redis.client;
  api.users = {

    // constants
    usersHash: "users",

    // methods

    add: function(userName, password, next){
      var self = this;
      redis.hget(self.usersHash, userName, function(error, data){
        if(error != null){
          next(error);
        }else if(data != null){
          next("userName already exists");
        }else{
          self.cryptPassword(password, function(error, hashedPassword){
            if(error != null){
              next(error);
            }else{
              var data = {
                userName: userName,
                hashedPassword: hashedPassword,
                createdAt: new Date().getTime(),
              }
              redis.hset(self.usersHash, userName, JSON.stringify(data), function(error){
                next(error);
              });
            }
          });
        }
      });
    },

    list: function(next){
      var self = this;
      redis.hgetall(self.usersHash, function(error, users){
        var userData = [];
        for(var i in users){
          userData.push( JSON.parse( users[i] ) );
        }
        next(error, userData);
      });
    },

    authenticate: function(userName, password, next){
      var self = this;
      redis.hget(self.usersHash, userName, function(error, data){
        if(error != null){
          next(error);
        }else{
          data = JSON.parse(data);
          self.comparePassword(data.hashedPassword, password, function(error, match){
            next(error, match);
          });
        }
      });
    },

    delete: function(userName, password, next){
      var self = this;
      redis.del(self.usersHash, userName, function(error){
        api.blog.listUserPosts(userName, function(error, titles){
          if(titles.length == 0 || error != null){
            next(error);
          }else{
            var started = 0;
            titles.forEach(function(title){
              started++;
              api.blog.deletePost(userName, title, function(error){
                started--;
                if(started == 0){
                  next();
                }
              });
            });
          }
        });
      });
    },

    // helpers

    cryptPassword: function(password, next) {
       bcrypt.genSalt(10, function(error, salt) {
        if (error){
          return next(error)
        }else{
          bcrypt.hash(password, salt, function(error, hashedPassword) {
              return next(error, hashedPassword);
          });
        }
      });
    },

    comparePassword: function(hashedPassword, userPassword, next) {
       bcrypt.compare(userPassword, hashedPassword, function(error, match){
          return next(error, match);
       });
    },
  }

  next();
}
