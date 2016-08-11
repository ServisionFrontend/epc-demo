"use strict";

let util = require('util');
let BaseModel = require('./BaseModel');

let defaultOptions = {
	path: '/index/brand-series',
	noCache: true
};

util.inherits(BrandModel, BaseModel);

function BrandModel(req, res, options) {
	this.opts = Object.assign({}, defaultOptions, options || {});

	BaseModel.call(this, req, res, this.opts);
};

Object.assign(BrandModel.prototype, {
	find: function() {
		return this.get();
	}
});


module.exports = BrandModel;