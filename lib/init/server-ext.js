'use strict';

const hoek = require('hoek');
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

  if (response.isBoom) {
    // reformat validation errors
    if (response.data && response.data.isJoi) { // Joi
      const errors = {};

      response.data.details.forEach((err) => {
        errors[err.path] = hoek.merge({type: err.type}, hoek.applyToDefaults(err.context, {
          key: undefined
        }, true), false);
      });

      newResponse = Boom.validationError(errors);
    }

    else if (response.isServer) {
      console.error(response.stack);
    }

  }

  return newResponse ? reply(newResponse) : reply.continue();
}
