'use strict';

const path = require('path');
const util = require('util');
const Hoek = require('hoek');

const plugins = [
  {name: 'log', module: 'good'},
  {name: 'db', module: './mongoose'},
  {name: 'pagination', module: './pagination'},
  {name: 'swaggerize', module: 'swaggerize-hapi'},
  {name: 'ext', module: './server-ext'},
  {name: 'rbac', module: 'hapi-swagger-rbac'},
  {name: 'dql', module: './mongo-dql'}
];

const defaults = {
  log: {
    ops: {
      interval: 60 * 60 * 1000
    },
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{log: '*', response: '*'}]
        },
        {
          module: 'good-console',
          args: [{format: 'YYYY-MM-DD HH:mm:ss.SSS'}]
        },
        'stdout'
      ]
    }
  },
  pagination: {
    limit: 10,
    maxLimit: 50
  },
  db: {},
  swaggerize: {},
  rbac: {},
  dql: {}
};

// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  const enabledPlugin = [];

  options = Hoek.applyToDefaults(defaults, options);

  plugins.forEach(function(plugin) {
    const pluginOptions = options[plugin.name];
    const disabled = pluginOptions === false;

    if (!disabled) {
      enabledPlugin.push({
        register: require(plugin.module),
        options: pluginOptions
      });
    }
  });

  return server
    .register(enabledPlugin)
    .then(next)
    .catch(next);
};

exports.register.attributes = {
  name: 'init'
};
