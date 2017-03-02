'use strict';

const Joi = require('joi');

module.exports = Joi.extend([
  {
    base: Joi.string(),
    name: 'string',
    language: {
      objectId: 'must be an ObjectId'
    },
    rules: [
      {
        name: 'objectId',
        validate(params, value, state, options) {
          if (/^[0-9a-fA-F]{24}$/.test(value))
            return value;

          return this.createError('string.objectId', {v: value}, state, options);
        }
      }
    ]
  }
]);
