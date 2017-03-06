'use strict';

const Boom = require('boom');
const hoek = require('hoek');
const MongoDQL = require('mongo-dql');
const traverse = require('../utils/traverse');

exports.register = function(server, options, next) {
  const basePath = options.spec && options.spec.basePath || '';
  const routes = {};

  // throw if no swagger spec was passed in options object
  hoek.assert(options.spec, new Error('Please provide a swagger spec.'));
  server.connections[0].table().forEach(function(route) {
    var key = route.public.path + '#' + route.public.method;
    routes[key] = route;
  });

  traverse(options.spec.paths, 'x-mongo-dql', function(config, parents) {
    const mongoDQL = new MongoDQL(null, config.sortMappings, config.defaults);

    const key = basePath + parents[0] + '#' + parents[1];
    const route = routes[key];

    if (route)
      route.settings.plugins.mongoDQL = mongoDQL;
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
