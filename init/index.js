'use strict';

// run core extension asap
require('./core-ext')();

exports.register = function(server, options, next) {
  const config = server.settings.app;

  // register logger before running any other initialization tasks
  return server
    .register({
      register: require('good'),
      options: config.log
    })
    .then(function() {
      require('./mongoose')(server);

      // load modules and plugins
      return server.register([
        {
          register: require('./pagination'),
          options: config.pagination
        },
        {
          register: require('./mongo-dql'),
          options: options
        },
        {
          register: require('./modules'),
          options: options
        },
        {
          register: require('./server-ext'),
        }
      ]);
    })
    .then(next)
    .catch(next);
};

exports.register.attributes = {
  name: 'init'
};
