'use strict';

let Swaggerize = require('swaggerize-hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
let Path = require('path');
// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  const config = server.settings.app;

  // register logger before running any other initialization tasks
  return server
    .register({
      register: require('good'),
      options: config.log
    })
    .then(function() {

      // load modules and plugins
      return server.register([
        {
          register: require('./pagination'),
          options: config.pagination
        },
        {
          register: require('./mongoose'),
        },
        {
          register: require('./mongo-dql'),
          options: options
        },
        {
          register: Swaggerize,
          options: {
            api: Path.resolve('./config/swagger.json'),
            handlers: Path.resolve('./api')
          }
        },
        {
          register: require('./server-ext'),
        }
      ]);
    })
    .then(next)
    .catch(next);
};

exports.register.attributes = {
  name: 'init'
};
