'use strict';

const gulp = require('gulp');
const mocha = require('gulp-spawn-mocha');

module.exports = function() {
  process.env.NODE_ENV = 'test';

  return gulp
    .src(['test/**/*.spec.js', 'modules/**/*.spec.js'], {read: false})
    .pipe(mocha({globals: 'server,app'}));
};
