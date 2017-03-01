'use strict';

const load = require('../load').load;

module.exports = {
  get: (request, reply) => {
    return load(request.params.id)
      .then((thing) => reply({results: {thing}}))
      .catch(reply);
  },
  put: (request, reply) => {
    return load(request.params.id)
      .then((thing) => {
        thing.name = request.payload.name;

        return thing.save();
      })
      .then((thing) => reply({results: {thing}}))
      .catch(reply);
  },
  delete: (request, reply) => {
    return load(request.params.id)
      .then((thing) => thing.remove())
      .then((thing) => reply({results: {thing}}).code(204))
      .catch(reply);
  }
};
