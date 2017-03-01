'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const hoek = require('hoek');
const mongoosePaginate = require('../utils/mongoose-paginate');

exports.register = function(server, options, next) {
  // throw if no database url was passed in options object
  hoek.assert(options.url, new Error('Please provide a database url.'));

  mongoose.Promise = Promise;
  mongoose.connect(options.url);

  [defaultOptionsPlugin, normalizerPlugin, toJsonPlugin, uniqueValidatorPlugin, mongoosePaginate.configure]
    .forEach((plugin) => {
      mongoose.plugin(plugin);
    });

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
      const options = hoek.applyToDefaults(defaultOptions, type.options.uniqueOptions || {});

      type.validate(function(value, respond) {
        if (!value) return respond(true);

        const query = this.constructor
          .where(type.path, (options.ci && value && type.instance === 'String') ? new RegExp('^' + hoek.escapeRegex(value) + '$', 'i') : value);

        if (this._id)
          query.where('_id').ne(this._id);

        query.count(function(err, count) {
          if (err)
            throw new err;

          return respond(!count);
        });
      }, `'{PATH}' must be unique`, 'unique')
    }
  });
}
