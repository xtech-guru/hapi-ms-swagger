'use strict';

const repl = require('repl');
const pkg = require('../package.json');

require('../server')
  .then(() => {
    const r = repl.start({prompt: `${pkg.name} > `});

    r.on('exit', () => {
      process.exit();
    });

    r.context.factory = require('../test/v1/factory');
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
