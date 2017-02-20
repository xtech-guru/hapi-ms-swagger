'use strict';

let Swaggerize = require('swaggerize-hapi');
let Path = require('path');
// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  // register logger before running any other initialization tasks
  return server
    .register({
      register: require('good'),
      options: options.log
    })
    .then(function() {
      // load modules and plugins
      return server.register([
        {
          register: require('./pagination'),
          options: options.pagination
        },
        {
          register: require('./mongoose'),
          options: options.db
        },
        {
          register: require('./mongo-dql'),
          options: options
        },
        {
          register: Swaggerize,
          options: {
            api: require('../config/swagger.json'),
            handlers: Path.resolve(__dirname+'/../api')
          }
        },
        {
          register: require('./server-ext'),
        }
      ]);
    })
    .then(next)
    .catch(next)
};

exports.register.attributes = {
  name: 'init'
};
