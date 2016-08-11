"use strict";

let util = require('util');
let BaseModel = require('../common/BaseModel');

util.inherits(CatalogModel, BaseModel);

function CatalogModel(req, res, options) {
  let self = this;

  self.context = {
    req: req,
    res: res
  };

  BaseModel.apply(this, [req, res, options]);
}

module.exports = CatalogModel;