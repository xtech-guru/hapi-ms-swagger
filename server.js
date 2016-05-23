'use strict';

const Hapi = require('hapi');
const config = require('./config');

console.log(`** ${config.name} v${config.version} (${config.env})
** node ${process.version}`);

// create
const server = new Hapi.Server({
  app: config
});

server.connection(config.connection);

// initialize then start
// exports a promise that is resolved when server is ready
module.exports = server
  .register(require('./init'))
  .then(() => server.start())
  .then(() => {
    server.log('info', `Server running at: ${server.info.uri}`);

    return server;
  })
  .catch((err) => {
    server.log('error', err.stack || err);
    process.exit(1);
  });
