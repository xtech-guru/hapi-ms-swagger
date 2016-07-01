'use strict';

const Promise = require('bluebird');
const gulp = require('gulp');
const mongoose = require('mongoose');
const lab = require('../lib/gulp-lab');

module.exports = function(done) {
  process.env.NODE_ENV = 'test';

  require('../server')
    .then((server) => {
      global.server = server;
      global.app = server.info.uri;

      // delete test database before starting
      return Promise.promisify(mongoose.connection.db.dropDatabase, {context: mongoose.connection.db})();
    })
    .then(() => {
      return gulp
        .src(['test/**/*.spec.js', 'modules/**/*.spec.js'], {read: false})
        .pipe(lab({
          verbose: true,
          leaks: false
        }))
        .once('error', function(err) {
          done(err);
        })
        .once('end', function() {
          done();
          process.exit();
        });
    });
};
