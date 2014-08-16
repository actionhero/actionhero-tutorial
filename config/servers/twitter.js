exports.default = {
  servers: {
    twitter: function(api){
      return {
        enabled: true,
        hashtag: "sports",
        // Be sure to fill these in with your own API keys
        consumer_key: "XXX",
        consumer_secret: "XXX",
        access_token_key: "XXX",
        access_token_secret: "XXX",
      }
    }
  }
}
