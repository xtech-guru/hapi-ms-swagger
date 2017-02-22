'use strict';

let Swaggerize = require('swaggerize-hapi');
let Path = require('path');
const enabledPLugins = [];
const plugins = [
  {name: 'log', module: 'good'},
  {name: 'db', module: './mongoose'},
  {name: 'pagination', module: './pagination'}
];

// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  plugins.forEach(function(plugin){
    if(options[plugin.name].enabled){
      delete options[plugin.name].enabled;
      enabledPLugins.push({
        register: require(plugin.module),
        options: options[plugin.name]
      })
    }
  });

  server.register(enabledPLugins)
  .then(() => {
    server.register([
      {
        register: Swaggerize,
        options: {
          api: require('../config/swagger.json'),
          handlers: Path.resolve(__dirname+'/../api')
        }
      },
      {
        register: require('./server-ext')
      }
    ])
  })
  .then(next)
  .catch(next)
};

exports.register.attributes = {
  name: 'init'
};
