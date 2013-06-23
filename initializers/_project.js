exports._project = function(api, next){
  // modify / append the api global variable
  // I will be run as part of actionHero's boot process

  next();
}