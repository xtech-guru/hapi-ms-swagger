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
  const send = (typeof config.send === 'function') ? config.send() : config.send;

  if (send)
    req.send(send);

  return req;
};

exports.createTests = function(lab, url, verb, configs) {
  configs.forEach((config) => {
    const title = config.title || ('should respond with ' + config.status);

    lab.it(title, config.options || {}, function() {
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
