'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const readdir = Promise.promisify(fs.readdir);

exports.register = function(server, options, next) {
  const versions = Array.isArray(options.versions) ? options.versions : ['v1'];

  return readdir(__dirname)
    .then(function(modules) {
      const plugins = [];

      modules.forEach((module) => {
        const dir = path.resolve(__dirname, module);
        let index = path.join(dir, 'index.js');

        // register module
        try {
          fs.accessSync(index, fs.R_OK);

          plugins.push({
            register: require(index),
            options: options
          });
        }
        catch (err) {
          /* no index file */
        }

        // register module routes
        versions.forEach((version) => {
          index = path.join(dir, version, 'index.js');

          try {
            fs.accessSync(index, fs.R_OK);
            plugins.push({
              register: require(index),
              options: options,
              routes: {prefix: `/${version}/${module}`}
            });
          }
          catch (err) {
            /* no index file */
          }
        });
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
