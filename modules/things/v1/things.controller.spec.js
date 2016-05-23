'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const testUtils = require('../../../test/utils');
const thingsFactory = require('./things.factory');

describe('things API v1', function() {
  const baseUrl = '/v1/things';
  const attributes = ['name'];
  const usedName = thingsFactory.buildSync('things').name;

  const idUrl = function() {
    return `${baseUrl}/${data[1]._id}`;
  };

  let data;

  beforeEach(function() {
    return thingsFactory
      .reset()
      .then(() => thingsFactory.createMany('things', [{name: usedName}], 2))
      .then((things) => {
        data = things;
      });
  });

  describe('GET /v1/things', function() {
    const check = function(res) {
      expect(res.body).to.have.lengthOf(2);

      res.body.forEach((item, index) => {
        expect(item).to.have.property('_id');
        expect(_.pick(item, attributes)).to.eql(_.pick(data[index], attributes));
      });
    };

    testUtils.createTests(baseUrl, 'get', [
      {status: 200, contentType: 'json', title: 'should return the list of existing things', check: check}
    ]);
  });

  describe('GET /v1/things/:id', function() {
    const check = function(res) {
      expect(res.body).to.have.property('_id');
      expect(_.pick(res.body, attributes)).to.eql(_.pick(data[1], attributes));
    };

    testUtils.createTests(idUrl, 'get', [
      {status: 200, contentType: 'json', title: 'should return the specified thing', check: check}
    ]);
  });

  describe('POST /v1/things', function() {
    const payload = thingsFactory.buildSync('things');

    const checkRequired = function(res) {
      expect(res.body.message).to.eql('ValidationError');
      expect(res.body.errors.name.type).to.eql('any.required');
    };

    const checkUnique = function(res) {
      expect(res.body.errors.name.type).to.eql('unique');
    };

    const checkSuccess = function(res) {
      expect(_.pick(res.body, attributes)).to.eql(_.pick(payload, attributes));
    };

    testUtils.createTests(baseUrl, 'post', [
      {
        status: 400,
        contentType: 'json',
        send: {},
        title: 'should fail because missing required name',
        check: checkRequired
      },
      {
        status: 400,
        contentType: 'json',
        send: {name: usedName},
        title: 'should fail because the name is already used',
        check: checkUnique
      },
      {
        status: 201,
        contentType: 'json',
        send: payload,
        title: 'should create and return the created thing',
        check: checkSuccess
      }
    ]);
  });

  describe('PUT /v1/things/:id', function() {
    const payload = thingsFactory.buildSync('things');

    const checkUnique = function(res) {
      expect(res.body.errors.name.type).to.eql('unique');
    };

    const checkSuccess = function(res) {
      expect(res.body._id).to.eql(data[1]._id.toString());
      expect(_.pick(res.body, attributes)).to.eql(_.pick(payload, attributes));
    };

    testUtils.createTests(idUrl, 'put', [
      {
        status: 400,
        contentType: 'json',
        send: {name: usedName},
        title: 'should fail because the name is already used',
        check: checkUnique
      },
      {
        status: 200,
        contentType: 'json',
        send: payload,
        title: 'should update and return the updated thing',
        check: checkSuccess
      }
    ]);
  });

  describe('Delete /v1/things/:id', function() {
    testUtils.createTests(idUrl, 'delete', [
      {status: 204, contentType: 'json', title: 'should delete the specified thing'}
    ]);
  });
});
