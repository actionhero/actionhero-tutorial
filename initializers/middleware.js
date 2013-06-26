exports.middleware = function(api, next){

  var authenticationMiddleware = function(connection, actionTemplate, next){
    if(actionTemplate.authenticated === true){
      api.users.authenticate(connection.params.userName, connection.params.password, function(error, match){
        if(match === true){
          next(connection, true);
        }else{
          connection.error = "Authentication Failed.  userName and password required";
          next(connection, false);
        }
      });
    }else{
      next(connection, true);
    }
  }

  api.actions.preProcessors.push(authenticationMiddleware);

  next();
}
