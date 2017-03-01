'use strict';

const Boom = require('boom');

module.exports = function() {
  // helper function to create validation errors
  Boom.validationError = function(errors) {
    const validationError = Boom.badRequest('ValidationError', errors);

    validationError.output.payload.errors = errors;

    return validationError;
  };
};
