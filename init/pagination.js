'use strict';

const defaults = {limit: 10, maxLimit: 50};
const hoek = require('hoek');

let settings;

exports.register = function(server, options, next) {
  settings = hoek.applyToDefaults(defaults, options.pagination);

  server.ext('onPreHandler', function(request, reply) {
    if (request.route.settings.plugins.pagination) {
      request.query.page = isNaN(request.query.page) ? 1 : Math.max(1, parseInt(request.query.page));
      request.query.limit = isNaN(request.query.limit) ? settings.limit : Math.min(settings.maxLimit, Math.max(1, parseInt(request.query.limit)));
    }

    reply.continue();
  });

  next();
};

exports.register.attributes = {
  name: 'pagination'
};
