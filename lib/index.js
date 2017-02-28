'use strict';

exports.register = function(server, options, next) {
  server
    .register({
      register: require('../init'),
      options: options
    })
    .then(next)
    .catch(next)
};

exports.register.attributes = {
  name: 'hapi-ms'
};
