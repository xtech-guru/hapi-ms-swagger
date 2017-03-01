'use strict';

exports.register = function(server, options, next) {
  server.ext('onPreHandler', function(request, reply) {
    if (request.route.settings.plugins.pagination) {
      request.query.page = isNaN(request.query.page) ? 1 : Math.max(1, parseInt(request.query.page));
      request.query.limit = isNaN(request.query.limit) ? options.limit : Math.min(options.maxLimit, Math.max(1, parseInt(request.query.limit)));
    }

    reply.continue();
  });

  next();
};

exports.register.attributes = {
  name: 'pagination'
};
