'use strict';

const Boom = require('boom');
const Hoek = require('hoek');
const MongoDQL = require('mongo-dql');
const path = require('path');
const traverse = require('traverse');

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

  const routes = server.connections[0].table().reduce((routes, route) => {
    routes[route.public.path + '#' + route.public.method] = route;

    return routes;
  }, {});

  traverse(options.spec.paths).forEach(function() {
    // we start traversing at the 'paths' element and mongo-dql configs must be defined on the path's operations, so
    // they can only exist on the third level
    if (this.key === 'x-mongo-dql' && this.path.length === 3) {
      const route = routes[basePath + this.path[0] + '#' + this.path[1]];

      if (route) {
        let conditionTransform = null;

        if (this.conditionTransform) {
          Hoek.assert(this.conditionTransform.module, `Expected 'conditionTransform.module' to be a non-empty string.`);
          Hoek.assert(this.conditionTransform.functionName, `Expected 'conditionTransform.functionName' to be a non-empty string.`);

          const conditionTransformModule = require(path.join(process.cwd(), this.conditionTransform.module));
          conditionTransform = conditionTransformModule[this.conditionTransform.functionName];

          Hoek.assert(typeof conditionTransform ===
                      'function', `Expected 'conditionTransform.functionName' to specify the name of a valid function.`);
        }

        route.settings.plugins.mongoDQL = new MongoDQL(conditionTransform, this.sortMappings, this.defaults);
      }
    }
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
