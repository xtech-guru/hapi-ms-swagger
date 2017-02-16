'use strict';

exports.register = function(server, options, next){
  server.register(require('./init'))
    .then(function(res){
    //  console.log('res', res);
    })
    .catch(function(err){
      console.log('err', errr);
    })
  next();
}

exports.register.attributes = {
  name: 'hapi-ms'
};
