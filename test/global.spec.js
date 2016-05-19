'use strict';

before(function() {
  this.timeout(0);

  return require('../server')
    .then(function(server) {
      global.server = server;
      global.app = server.info.uri;
    });
});
