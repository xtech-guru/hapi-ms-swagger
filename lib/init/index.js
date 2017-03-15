'use strict';

const Hoek = require('hoek');
const config = require('./config');

// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  const enabledPlugin = [];

  options = Hoek.applyToDefaults(config.defaults, options);

  config.plugins.forEach(function(plugin) {
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
