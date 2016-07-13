'use strict';

const path = require('path');
const Promise = require('bluebird');
const glob = require('glob');

exports.register = function(server, options, next) {
  const config = server.settings.app;
  const versions = Array.isArray(config.versions) ? config.versions : ['v1'];

  return Promise.promisify(glob)('**/index.js', {cwd: __dirname})
    .then(function(files) {
      const plugins = [];

      files.forEach((file) => {
        let parts = file.split(path.sep);

        parts.pop(); // remove 'index.js'

        // the second element is the API version
        if (parts.length > 1)
          parts.push(parts.splice(1, 1)[0]);

        // reverse to have [version, subpaths..., module]
        parts = parts.reverse();

        // register only module's main plugin and plugins of enabled versions
        if (parts.length === 1 || (parts.length > 1 && versions.indexOf(parts[0]) >= 0)) {
          // load the module
          const module = require(path.resolve(__dirname, file));

          // register it if it's a plugin
          if (typeof module.register === 'function') {
            plugins.push({
              register: module,
              options: options,
              routes: {prefix: '/' + parts.join('/')}
            });
          }
        }
      });

      return plugins;
    })
    .then(function(plugins) {
      return server.register(plugins);
    })
    .then(next)
    .catch(next);
};

exports.register.attributes = {
  name: 'modules'
};
