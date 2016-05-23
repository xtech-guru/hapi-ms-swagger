'use strict';

before(function() {
  this.timeout(0);

  return require('../server')
    .then((server) => {
      global.server = server;
      global.app = server.info.uri;
    });
});
