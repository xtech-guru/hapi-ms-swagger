'use strict';

const Boom = require('boom');
const MongoDQL = require('mongo-dql');

exports.register = function(server, options, next) {
  const spec = options.spec;

  traverse(spec, 'x-mongodql', function(mongoDql, parents) {

    const listDQL = new MongoDQL(null, mongoDql.sortMappings, mongoDql.defaults);
    console.log('listDQL', listDQL);
});



  server.ext('onPreHandler', onPreHandler);

  next();
};


function onPreHandler (request, reply) {

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

exports.register.attributes = {
  name: 'mongo-dql'
};
