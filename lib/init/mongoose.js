'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Hoek = require('hoek');
const Boom = require('boom');
const mongoosePaginate = require('../utils/mongoose-paginate');

exports.register = function(server, options, next) {
  // throw if no database url was passed in options object
  Hoek.assert(options.url, new Error('Please provide a database url.'));

  mongoose.Promise = Promise;
  mongoose.connect(options.url);

  [defaultOptionsPlugin, normalizerPlugin, toJsonPlugin, uniqueValidatorPlugin, mongoosePaginate.configure]
    .forEach((plugin) => {
      // apply globally for all new schemas
      mongoose.plugin(plugin);

      // apply for registered schemas
      mongoose.modelNames().forEach(function(modelName) {
        plugin(mongoose.model(modelName).schema);
      });
    });

  server.ext('onPreResponse', onPreResponse);

  next();
};

exports.register.attributes = {
  name: 'init-mongoose'
};

// set default options
function defaultOptionsPlugin(schema) {
  if (schema.get('timestamps') === undefined)
    schema.set('timestamps', true);
}

// run normalization on before save
function normalizerPlugin(schema) {
  schema.pre('save', function(next) {
    schema.eachPath((path) => {
      if (path.substr(0, 11) === 'normalized.') {
        const source = path.substr(11);

        if (this.isDirectModified(source)) {
          const value = this.get(source);

          if (typeof value === 'string')
            this.set(path, value.toLowerCase());
          else if (value !== undefined)
            this.set(path, value);
        }
      }
    });

    next();
  });
}

// set default JSON transform function to remove common private properties
function toJsonPlugin(schema) {
  const toJSON = schema.get('toJSON') || {};
  const originalTransform = toJSON.transform;

  toJSON.transform = function(doc, ret, options) {
    if (originalTransform)
      ret = originalTransform(doc, ret, options);

    delete ret.normalized;
    delete ret.password;
    delete ret.passwordHash;

    return ret;
  };

  schema.set('toJSON', toJSON);
}

// add unique validator to unique paths
function uniqueValidatorPlugin(schema) {
  const defaultOptions = {ci: true};

  schema.eachPath((path, type) => {
    if (type._index && type._index.unique) {
      const options = Hoek.applyToDefaults(defaultOptions, type.options.uniqueOptions || {});

      type.validate(function(value) {
        if (!value) return Promise.resolve(true);

        const query = this.constructor
          .where(type.path, (options.ci && value && type.instance === 'String') ? new RegExp('^' + Hoek.escapeRegex(value) + '$', 'i') : value);

        if (this._id)
          query.where('_id').ne(this._id);

        return query
          .count()
          .then((count) => {
            return !count;
          });
      }, `'{PATH}' must be unique`, 'unique')
    }
  });
}

// reformat mongoose validation errors
function onPreResponse(request, reply) {
  const response = request.response;
  let newResponse = null;

  if (response && response.isBoom && response instanceof mongoose.Error.ValidationError) {
    const errors = {};

    Object.keys(response.errors).forEach((key) => {
      const err = response.errors[key];

      errors[key] = Hoek.merge({type: err.kind}, Hoek.applyToDefaults(err.properties, {
        type: undefined,
        message: undefined,
        path: undefined
      }, true), false);
    });

    newResponse = Boom.validationError(errors);
  }

  return newResponse ? reply.continue(newResponse) : reply.continue();
}
