'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');

module.exports = function() {
  process.env.NODE_ENV = 'test';

  return require('../server')
    .then((server) => {
      global.server = server;
      global.app = server.info.uri;
    })
    .then(() => {
      return gulp
        .src(['test/**/*.spec.js', 'modules/**/*.spec.js'], {read: false})
        .pipe(mocha({globals: 'server,app'}))
        .once('error', function() {
          process.exit(1);
        })
        .once('end', function() {
          process.exit();
        });
    });
};
