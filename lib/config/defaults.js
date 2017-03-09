'use strict';

exports.defaults = {
  log: {
    ops: {
      interval: 60 * 60
    },
    reporters: {
      console: [
        {
          module: 'good-console',
          args: [{format: 'YYYY-MM-DD HH:mm:ss.SSS'}]
        },
        'stdout'
      ]
    }
  },
  pagination: {
    limit: 10,
    maxLimit: 50
  },
  db: {},
  swaggerize: {},
  rbac: {},
  dql: {}
};
