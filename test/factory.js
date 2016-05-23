'use strict';

const Promise = require('bluebird');
const factoryGirl = require('factory-girl');
const MongooseAdapter = require('factory-girl-mongoose').MongooseAdapter;

exports.create = function() {
  const factory = new factoryGirl.Factory().promisify(Promise);
  const define = factory.define;
  const models = [];

  factory.setAdapter(MongooseAdapter);

  factory.define = function(name, model, attributes, options) {
    models.push(model);

    return define.call(factory, name, model, attributes, options);
  };

  // cleanup and remove any models created outside of the factory
  factory.reset = function() {
    return factory
      .cleanup()
      .then(() => Promise.mapSeries(models, (model) => model.remove({})));
  };

  return factory;
};
