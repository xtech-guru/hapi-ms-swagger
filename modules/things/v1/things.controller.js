'use strict';

const Promise = require('bluebird');
const Boom = require('boom');
const Things = require('./things.model');

exports.list = function(request, reply) {
  const q = request.plugins.mongoDQL;

  return Promise
    .try(function() {
      return Things.Model
        .paginate(q.where, {
          page: request.query.page,
          limit: request.query.limit,
          sort: q.orderBy
        });
    })
    .then(([meta, results]) => reply({
      meta,
      results: {
        things: results
      }
    }))
    .catch(reply);
};

exports.create = function(request, reply) {
  return Things.Model
    .create(request.payload)
    .then((thing) => reply({results: {thing}}).code(201))
    .catch(reply);
};

exports.show = function(request, reply) {
  return load(request.params.id)
    .then((thing) => reply({results: {thing}}))
    .catch(reply);
};

exports.update = function(request, reply) {
  return load(request.params.id)
    .then((thing) => {
      thing.name = request.payload.name;

      return thing.save();
    })
    .then((thing) => reply({results: {thing}}))
    .catch(reply);
};

exports.remove = function(request, reply) {
  return load(request.params.id)
    .then((thing) => thing.remove())
    .then((thing) => reply({results: {thing}}).code(204))
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
