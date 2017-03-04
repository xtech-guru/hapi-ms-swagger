'use strict';

const Boom = require('boom');
const MongoDQL = require('mongo-dql');
const traverse = require('../utils/traverse');

exports.register = function(server, options, next) {
  const spec = options.spec;

  traverse(spec, 'x-mongodql', function(config, parents) {
    const mongoDQL = new MongoDQL(null, config.sortMappings, config.defaults);
    console.log('mongoDQL', mongoDQL);
  });

  server.ext('onPreHandler', onPreHandler);

  next();
};

exports.register.attributes = {
  name: 'mongo-dql'
};

function onPreHandler(request, reply) {
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
}
