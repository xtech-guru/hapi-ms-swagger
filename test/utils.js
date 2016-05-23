'use strict';

const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-http'));
chai.request.addPromises(require('bluebird'));

exports.contentTypes = {
  json: /application\/json/
};

exports.request = function(url, verb, config) {
  const req = chai.request(app)[verb](url);

  if (config.send)
    req.send(config.send);

  return req;
};

exports.createTests = function(url, verb, configs) {
  configs.forEach((config) => {
    const title = config.title || ('should respond with ' + config.status);

    it(title, function() {
      if (!isNaN(config.timeout))
        this.timeout(config.timeout);

      const finalUrl = (typeof url === 'function') ? url() : url;

      return exports
        .request(finalUrl, verb, config)
        .catch((err) => {
          // catch http response errors and pass the responses for checking
          if (err.response && err.status)
            return err.response;

          throw err;
        })
        .then((res) => {
          expect(res).to.have.status(config.status);

          if (config.contentType)
            expect(res).to.have.header('content-type', exports.contentTypes[config.contentType] || config.contentType);

          if (typeof config.check === 'function')
            config.check(res);

          return null;
        });

    });
  });
};
