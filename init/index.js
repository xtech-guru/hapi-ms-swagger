'use strict';

let Swaggerize = require('swaggerize-hapi');
let Path = require('path');
const util = require('util');
const enabledPlugin = [];
const plugins = [
  {name: 'log', module: 'good'},
  {name: 'db', module: './mongoose'},
  {name: 'pagination', module: './pagination'}
];

const defaults = {
  api: require('../config/swagger.json'),
  handlers: Path.resolve(__dirname+'/../api')
};

// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  plugins.forEach(function(plugin){
    if(options[plugin.name].enabled){
      delete options[plugin.name].enabled;
      enabledPlugin.push({
        register: require(plugin.module),
        options: options[plugin.name]
      })
    }
  });

 return server.register(enabledPlugin)
  .then(() => {
    return server.register([
      {
        register: Swaggerize,
        options: require('hoek').applyToDefaults(defaults, options.swaggerize)
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
