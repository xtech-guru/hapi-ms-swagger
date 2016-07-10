'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const testUtils = require('../../../test/utils');
const factory = require('../../../test/v1/factory');

lab.describe('things API v1', function() {
  const baseUrl = '/v1/things';
  const attributes = ['name'];

  const idUrl = function() {
    return `${baseUrl}/${data[1]._id}`;
  };

  let data;

  lab.beforeEach(function() {
    return factory
      .cleanup()
      .then(() => factory.createMany('things', 2))
      .then((things) => {
        data = things;
      });
  });

  lab.describe('GET /v1/things', function() {
    const check = function(res) {
      const sorted = _.sortBy(data, 'name');

      expect(res.body).to.have.property('meta');
      expect(res.body.meta.count).to.equal(2);

      expect(res.body).to.have.property('results');
      expect(res.body.results.things).to.have.lengthOf(2);

      res.body.results.things.forEach((item, index) => {
        expect(item).to.have.property('_id');
        expect(_.pick(item, attributes)).to.eql(_.pick(sorted[index], attributes));
      });
    };

    testUtils.createTests(lab, baseUrl, 'get', [
      {status: 200, contentType: 'json', title: 'should return the list of existing things', check: check}
    ]);
  });

  lab.describe('GET /v1/things/:id', function() {
    const check = function(res) {
      expect(res.body).to.have.property('results');
      expect(res.body.results.thing).to.have.property('_id');
      expect(_.pick(res.body.results.thing, attributes)).to.eql(_.pick(data[1], attributes));
    };

    testUtils.createTests(lab, idUrl, 'get', [
      {status: 200, contentType: 'json', title: 'should return the specified thing', check: check}
    ]);
  });

  lab.describe('POST /v1/things', function() {
    const checkRequired = function(res) {
      expect(res.body.message).to.eql('ValidationError');
      expect(res.body.errors.name.type).to.eql('any.required');
    };

    const checkUnique = function(res) {
      expect(res.body.errors.name.type).to.eql('unique');
    };

    const checkSuccess = function(res) {
      expect(res.body).to.have.property('results');
      expect(_.pick(res.body.results.thing, attributes)).to.eql(_.pick(res.request._data, attributes));
    };

    testUtils.createTests(lab, baseUrl, 'post', [
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
        send: () => factory.attrs('things', {name: data[0].name}),
        title: 'should fail because the name is already used',
        check: checkUnique
      },
      {
        status: 201,
        contentType: 'json',
        send: () => factory.attrs('things'),
        title: 'should create and return the created thing',
        check: checkSuccess
      }
    ]);
  });

  lab.describe('PUT /v1/things/:id', function() {
    const checkUnique = function(res) {
      expect(res.body.errors.name.type).to.eql('unique');
    };

    const checkSuccess = function(res) {
      expect(res.body).to.have.property('results');
      expect(res.body.results.thing._id).to.eql(data[1]._id.toString());
      expect(_.pick(res.body.results.thing, attributes)).to.eql(_.pick(res.request._data, attributes));
    };

    testUtils.createTests(lab, idUrl, 'put', [
      {
        status: 400,
        contentType: 'json',
        send: () => factory.attrs('things', {name: data[0].name}),
        title: 'should fail because the name is already used',
        check: checkUnique
      },
      {
        status: 200,
        contentType: 'json',
        send: () => factory.attrs('things'),
        title: 'should update and return the updated thing',
        check: checkSuccess
      }
    ]);
  });

  lab.describe('DELETE /v1/things/:id', function() {
    testUtils.createTests(lab, idUrl, 'delete', [
      {status: 204, contentType: 'json', title: 'should delete the specified thing'}
    ]);
  });
});
