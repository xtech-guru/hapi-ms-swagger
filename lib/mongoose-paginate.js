'use strict';

const Promise = require('bluebird');

module.exports = {
  getPage: getPage,
  configure: function(schema) {
    schema.statics.paginate = paginate;
    schema.statics.paginateGeoNear = paginateGeoNear;
  }
};

function getPage(options) {
  const pageNumber = Math.max(1, parseInt(options.page) || 1) - 1;
  const resultsPerPage = options.limit || 10;
  const skipFrom = pageNumber * resultsPerPage;

  return {
    pageNumber: pageNumber,
    resultsPerPage: resultsPerPage,
    skipFrom: skipFrom
  }
}

/**
 * @method paginate
 * @param {Object} q Mongoose Query Object
 * @param {Object} options pagination options
 * @param {Function} callback callback function
 *
 * Extend Mongoose Models to paginate queries
 */
function paginate(q, options, callback) {
  const model = this;
  const page = getPage(options);
  let query = model.find(q);

  if (options.select)
    query = query.select(options.select);

  if (options.sort)
    query.sort(options.sort);

  if (options.populate)
    query = query.populate(options.populate);

  query = query.skip(page.skipFrom).limit(page.resultsPerPage);

  return Promise
    .all([
      query.exec(),
      model.count(q).exec()
    ])
    .spread(function(results, count) {
      const meta = {
        page: page.pageNumber + 1,
        limit: page.resultsPerPage,
        pageCount: Math.ceil(count / page.resultsPerPage) || 1,
        count
      };

      return [meta, results];
    })
    .asCallback(callback, {spread: true});
}

function paginateGeoNear(geoJSON, geoOptions, options, callback) {
  const model = this;
  const page = getPage(options);

  return model
    .geoNear(geoJSON, geoOptions)
    .then(function(allResults) {
      const count = allResults.length;
      const results = allResults.slice(page.skipFrom, page.skipFrom + page.resultsPerPage);

      return [results, Math.ceil(count / page.resultsPerPage) || 1, count, allResults];
    })
    .asCallback(callback, {spread: true});
}
