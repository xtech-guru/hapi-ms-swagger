'use strict';

const ctrl = require('./things.controller');
const schemas = require('./things.schemas');

exports.register = function(server, options, next) {
  server.route({
    path: '/',
    method: 'GET',
    handler: ctrl.list
  });

  server.route({
    path: '/',
    method: 'POST',
    config: {
      validate: {payload: schemas.postPayload}
    },
    handler: ctrl.create
  });

  server.route({
    path: '/{id}',
    method: 'GET',
    config: {
      validate: {params: schemas.itemParams}
    },
    handler: ctrl.show
  });

  server.route({
    path: '/{id}',
    method: 'PUT',
    config: {
      validate: {params: schemas.itemParams, payload: schemas.putPayload}
    },
    handler: ctrl.update
  });

  server.route({
    path: '/{id}',
    method: 'DELETE',
    config: {
      validate: {params: schemas.itemParams}
    },
    handler: ctrl.remove
  });

  next();
};

exports.register.attributes = {
  name: 'thing'
};
