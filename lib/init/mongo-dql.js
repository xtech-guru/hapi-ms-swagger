'use strict';

const Boom = require('boom');
const Hoek = require('hoek');
const MongoDQL = require('mongo-dql');
const path = require('path');
const traverse = require('../utils/traverse');

exports.register = function(server, options, next) {
  register(server, options);
  server.ext('onPreHandler', onPreHandler);
  next();
};

exports.register.attributes = {
  name: 'mongo-dql'
};

function register(server, options) {
  Hoek.assert(options.spec, new Error(`Expected 'spec' to be an object.`));

  const basePath = options.spec.basePath || '';
  const routes = {};

  server.connections[0].table().forEach(function(route) {
    const key = route.public.path + '#' + route.public.method;
    routes[key] = route;
  });

  traverse(options.spec.paths, 'x-mongo-dql', function(config, parents) {
    let conditionTransform = null;

    if (config.conditionTransform) {
      Hoek.assert(config.conditionTransform.module, `Expected 'conditionTransform.module' to be a non-empty string.`);
      Hoek.assert(config.conditionTransform.functionName, `Expected 'conditionTransform.functionName' to be a non-empty string.`);

      const conditionTransformModule = require(path.join(process.cwd(), config.conditionTransform.module));
      conditionTransform = conditionTransformModule[config.conditionTransform.functionName];

      Hoek.assert(typeof conditionTransform === 'function', `Expected 'conditionTransform.functionName' to specify the name of a valid function.`);
    }

    const mongoDQL = new MongoDQL(conditionTransform, config.sortMappings, config.defaults);
    const key = basePath + parents[0] + '#' + parents[1];
    const route = routes[key];

    if (route)
      route.settings.plugins.mongoDQL = mongoDQL;
  });
}

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
