'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const factoryGirl = require('factory-girl');
const MongooseAdapter = require('factory-girl-mongoose').MongooseAdapter;

const factory = factoryGirl.promisify(Promise);

// fix ObjectAdapter.destroy() not calling cb
factory.ObjectAdapter.prototype.destroy = function(doc, Model, cb) {
  cb()
};

factory.setAdapter(MongooseAdapter);

module.exports = factory;

// definitions

factory.define('things', require('../../modules/things/v1/things.model').Model, {
  name: function() {
    return faker.name.findName();
  }
});
