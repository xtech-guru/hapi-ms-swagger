'use strict';

const Promise = require('bluebird');
const Things = require('./things.model');

module.exports = {
  get: (req, reply) => {
    //const q = req.plugins.mongoDQL;

    return Promise
      .try(() => {
        return Things.Model
          .paginate({} /*q.where*/, {
            page: req.query.page,
            limit: req.query.limit,
            sort: {} /*q.orderBy*/
          });
      })
      .then(([meta, results]) => reply({
        meta,
        results: {
          things: results
        }
      }))
      .catch(reply);
  },
  post: (request, reply) => {
    return Things.Model
      .create(request.payload)
      .then((thing) => reply({results: {thing}}).code(201))
      .catch(reply);
  }
};
