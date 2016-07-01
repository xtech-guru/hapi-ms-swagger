'use strict';

const Promise = require('bluebird');
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const mongoose = require('mongoose');

module.exports = function() {
  process.env.NODE_ENV = 'test';

  return require('../server')
    .then((server) => {
      global.server = server;
      global.app = server.info.uri;

      // delete test database before starting
      return Promise.promisify(mongoose.connection.db.dropDatabase, {context: mongoose.connection.db})();
    })
    .then(() => {
      return gulp
        .src(['test/**/*.spec.js', 'modules/**/*.spec.js'], {read: false})
        .pipe(mocha({globals: 'server,app'}))
        .once('error', function(err) {
          console.error(err);
          process.exit(1);
        })
        .once('end', function() {
          process.exit();
        });
    });
};
