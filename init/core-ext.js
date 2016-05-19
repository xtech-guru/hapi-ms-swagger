'use strict';

const Joi = require('joi');

module.exports = function() {
  // add validation for mongodb ObjectIds to Joi
  Joi.string().constructor.prototype.objectId = function() {
    var obj = this._test('objectId', undefined, (value, state, options) => {
      if (/^[0-9a-fA-F]{24}$/.test(value))
        return null;

      return this.createError('string.objectId', {value}, state, options);
    });

    obj._settings = {language: {string: {objectId: 'must be an ObjectId'}}};

    return obj;
  };
};
