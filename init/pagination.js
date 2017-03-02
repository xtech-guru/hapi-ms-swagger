'use strict';

const _ = require('lodash');

const defaults = {limit: 10, maxLimit: 50};

let settings;

exports.register = function(server, options, next) {
  settings = _.defaults(_.clone(options), defaults);

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
