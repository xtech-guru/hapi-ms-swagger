'use strict';

const _ = require('lodash');
const Boom = require('boom');
const mongoose = require('mongoose');

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
        errors[err.path] = _.merge({type: err.type}, _.omit(err.context, ['key']));
      });

      newResponse = Boom.validationError(errors);
    }
    else if (response instanceof mongoose.Error.ValidationError) { // Mongoose
      const errors = {};

      Object.keys(response.errors).forEach((key) => {
        const err = response.errors[key];

        errors[key] = _.merge({type: err.kind}, _.omit(err.properties, ['type', 'message', 'path']));
      });

      newResponse = Boom.validationError(errors);
    }
    else if (response.isServer)
      console.error(response.stack);
  }

  return newResponse ? reply(newResponse) : reply.continue();
}
