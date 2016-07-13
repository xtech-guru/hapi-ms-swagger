'use strict';

const Promise = require('bluebird');
const gulp = require('gulp');
const lab = require('gulp-lab-no-spawn');
const mongoose = require('mongoose');

const tmpCollection = '__tmp__';

module.exports = function(done) {
  process.env.NODE_ENV = 'test';

  require('../server')
    .then((server) => {
      global.server = server;
      global.app = server.info.uri;
    })
    .then(() => mongoose.connection.db.dropDatabase()) // delete test database to avoid unwanted data from old tests
    .then(() => mongoose.connection.db.createCollection(tmpCollection)) // make sure the db is created to avoid timeouts in tests
    .then(() => mongoose.connection.db.dropCollection(tmpCollection)) // remove temporary collection
    .then(() => {
      return gulp
        .src(['test/**/*.spec.js', 'modules/**/*.spec.js'], {read: false})
        .pipe(lab({
          verbose: true,
          globals: [
            'server', // set by this task
            'app', // set by this task
            'content', // seems to be set by node
            'store@sparkles' // set by the 'sparkles' module
          ]
        }))
        .once('error', function(err) {
          done(err);
          process.exit(1);
        })
        .once('end', function() {
          done();
          process.exit();
        });
    });
};
