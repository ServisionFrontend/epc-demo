"use strict";

let doRequest = require('../../core/doRequest');
let redisHandler = require('../../core/redisHandler');
let config = require('../../config');
let defaultOptions = {
  server: config.serverMap.epcServer,
  method: 'GET',
  contentType: 'application/json'
};

function BaseModel(req, res, options) {
  let self = this;

  self.className = 'BaseModel';

  self.context = {
    req: req,
    res: res
  };

  self.options = options || {};
}

BaseModel.prototype.get = function (opts, resultWithResponse) {
  let self = this;
  let curOptions = Object.assign({}, defaultOptions, self.options);
  let tempOpts = Object.assign(curOptions, opts);

  return new Promise(function (resolve, reject) {

    execute(self.context.req, self.context.res, tempOpts, resolve, reject, resultWithResponse);
  });
};

BaseModel.prototype.post = function (opts, resultWithResponse) {
  let method = {method: 'POST'};

  return this.get.apply(this, [Object.assign({}, method, opts), resultWithResponse]);
};

BaseModel.prototype.put = function (opts, resultWithResponse) {
  let method = {method: 'PUT'};

  return this.get.apply(this, [Object.assign({}, method, opts), resultWithResponse]);
};

BaseModel.prototype.delete = function (opts, resultWithResponse) {
  let method = {method: 'DELETE'};

  return this.get.apply(this, [Object.assign({}, method, opts), resultWithResponse]);
};

function execute(req, res, opts, resolve, reject, resultWithResponse) {
  opts.req = req;

  if (opts.method === 'GET' && opts.noCache !== true) {
    redisHandler.get(req, function(data) {

      if (data) {
        resolve(data);
        return;
      }

      doRequest(opts, function(response, body) {
        res.status(response && response.statusCode || 200);
        if (resultWithResponse) {
          resolve({
            res: response,
            body: body
          });
        } else {
          resolve(body);
        }
        if (body.success) {
          redisHandler.set(req, body);
        }
      }, reject);

    });
  } else {

    doRequest(opts, function (response, body) {
      if (opts.res) {
        resolve(response);
      } else {
        res.status(response && response.statusCode || 200);
        if (resultWithResponse) {
          resolve({
            res: response,
            body: body
          });
        } else {
          resolve(body);
        }
      }
    }, reject);

  }
}

module.exports = BaseModel;