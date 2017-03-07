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

const defaults = require('../utils/defaults').defaults
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
