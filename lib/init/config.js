'use strict';

exports.plugins = [
  {name: 'log', module: 'good'},
  {name: 'db', module: './mongoose'},
  {name: 'pagination', module: './pagination'},
  {name: 'swaggerize', module: 'swaggerize-hapi'},
  {name: 'ext', module: './server-ext'},
  {name: 'rbac', module: '@xtech-pub/hapi-swagger-rbac'},
  {name: 'dql', module: './mongo-dql'}
];

exports.defaults = {
  log: {
    ops: {
      interval: 60 * 60 * 1000
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
