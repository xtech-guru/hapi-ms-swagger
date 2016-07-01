'use strict';

const domain = require('domain');
const Lab = require('lab');
const through = require('through2');

module.exports = function gulpLab(options) {
  const paths = [];

  return through.obj(function(file, enc, cb) {
    paths.push(file.path);
    cb(null, file);
  }, function(cb) {
    const d = domain.create();

    d.on('error', (err) => this.emit('error', err));

    d.run(() => {
      const scripts = paths.map(function(path) {
        return require(path).lab;
      });

      Lab.report(scripts, options, (err) => {
        if (err)
          this.emit('error', err);
        else
          this.emit('end');

        cb();
      });
    });
  });
};
