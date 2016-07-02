'use strict';

const Promise = require('bluebird');
const gulp = require('gulp');
const lab = require('gulp-lab-no-spawn');
const mongoose = require('mongoose');

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
