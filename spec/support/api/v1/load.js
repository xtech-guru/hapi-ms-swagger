'use strict';

const Things = require('./things.model');
const Boom = require('boom');

exports.load = (id) => {
  return Things.Model
    .findById(id)
    .then((thing) => {
      if (!thing)
        throw Boom.notFound();

      return thing;
    });
};
