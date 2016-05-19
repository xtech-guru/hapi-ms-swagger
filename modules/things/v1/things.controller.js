'use strict';

const Boom = require('boom');
const Things = require('./things.model');

exports.list = function(request, reply) {
  return Things.Model
    .find()
    .then(reply)
    .catch(reply);
};

exports.create = function(request, reply) {
  Things.Model
    .create(request.payload)
    .then(function(model) {
      return reply(model).code(201);
    })
    .catch(reply);
};

exports.show = function(request, reply) {
  return load(request.params.id)
    .then(reply)
    .catch(reply);
};

exports.update = function(request, reply) {
  return load(request.params.id)
    .then(function(model) {
      model.name = request.payload.name;

      return model.save();
    })
    .then(reply)
    .catch(reply);
};

exports.remove = function(request, reply) {
  return load(request.params.id)
    .then(function(model) {
      return model.remove();
    })
    .then(function(model) {
      return reply(model).code(204);
    })
    .catch(reply);
};

function load(id) {
  return Things.Model
    .findById(id)
    .then(function(model) {
      if (!model)
        throw Boom.notFound();

      return model;
    });
}
