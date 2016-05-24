'use strict';

const Boom = require('boom');
const Things = require('./things.model');

exports.list = function(request, reply) {
  const q = request.plugins.mongoDQL;

  return Things.Model
    .find(q.where)
    .sort(q.orderBy)
    .then((things) => reply({things}))
    .catch(reply);
};

exports.create = function(request, reply) {
  return Things.Model
    .create(request.payload)
    .then((thing) => reply({thing}).code(201))
    .catch(reply);
};

exports.show = function(request, reply) {
  return load(request.params.id)
    .then((thing) => reply({thing}))
    .catch(reply);
};

exports.update = function(request, reply) {
  return load(request.params.id)
    .then((thing) => {
      thing.name = request.payload.name;

      return thing.save();
    })
    .then((thing) => reply({thing}))
    .catch(reply);
};

exports.remove = function(request, reply) {
  return load(request.params.id)
    .then((thing) => thing.remove())
    .then((thing) => reply({thing}).code(204))
    .catch(reply);
};

function load(id) {
  return Things.Model
    .findById(id)
    .then((thing) => {
      if (!thing)
        throw Boom.notFound();

      return thing;
    });
}
