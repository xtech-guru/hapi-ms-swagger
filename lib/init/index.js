'use strict';

const Hoek = require('hoek');
const SwaggerParser = require('swagger-parser');
const config = require('./config');

// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  const enabledPlugin = [];

  Hoek.assert(!!options.api, `Expected the Swagger spec to be passed in the 'api' option.`);

  options = Hoek.applyToDefaults(config.defaults, options);

  return SwaggerParser
    .validate(options.api)
    .then((api) => {
      config.plugins.forEach(function(plugin) {
        const pluginOptions = options[plugin.name];
        const disabled = pluginOptions === false;

        if (!disabled) {
          if (plugin.api)
            pluginOptions[plugin.api] = api;

          enabledPlugin.push({
            register: require(plugin.module),
            options: pluginOptions
          });
        }
      });
    })
    .then(() => server.register(enabledPlugin))
    .then(next)
    .catch(next);
};

exports.register.attributes = {
  name: 'init'
};
