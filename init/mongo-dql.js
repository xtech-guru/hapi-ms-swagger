'use strict';

const Boom = require('boom');

exports.register = function(server, options, next) {
  server.ext('onPreHandler', function(request, reply) {
    const mongoDQL = request.route.settings.plugins.mongoDQL;

    if (mongoDQL) {
      const q = request && request.query && request.query.q || '';

      try {
        request.plugins.mongoDQL = mongoDQL.parse(q);
        reply.continue();
      }
      catch (err) {
        reply(Boom.validationError({
          q: {
            type: 'mongoDQL',
            value: q,
            hash: err.hash
          }
        }));
      }
    }
    else
      reply.continue();
  });

  next();
};

exports.register.attributes = {
  name: 'mongo-dql'
};
