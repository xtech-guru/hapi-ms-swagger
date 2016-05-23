'use strict';

const faker = require('faker');
const Factory = require('../../../test/factory');
const Things = require('./things.model');

const factory = Factory.create();

factory.define('things', Things.Model, {
  name: function() {
    return faker.name.findName();
  }
});

module.exports = factory;
