'use strict';

const Hoek = require('hoek');
const Boom = require('boom');

exports.register = function(server, options, next) {
  server.ext('onPreResponse', onPreResponse);
  next();
};

exports.register.attributes = {
  name: 'init-server-ext'
};

function onPreResponse(request, reply) {
  const response = request.response;
  let newResponse = null;

  if (response && response.isBoom) {
    // reformat validation errors
    if (response.data && Array.isArray(response.data.details)) { // Joi
      const errors = {};

      response.data.details.forEach((err) => {
        errors[err.path] = Hoek.merge({type: err.type}, Hoek.applyToDefaults(err.context, {
          key: undefined
        }, true), false);
      });

      newResponse = Boom.validationError(errors);
    }
    else if (response.isServer) {
      console.error(response.stack);
    }

  }

  return newResponse ? reply.continue(newResponse) : reply.continue();
}
