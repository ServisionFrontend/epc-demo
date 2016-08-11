"use strict";

let util = require('util');
let BaseModel = require('./BaseModel');

let defaultOptions = {
	path: '/index/group-model',
	noCache: true
};

util.inherits(ModelModel, BaseModel);

function ModelModel(req, res, options) {
	this.opts = Object.assign({}, defaultOptions, options || {});

	BaseModel.call(this, req, res, this.opts);
};

Object.assign(ModelModel.prototype, {
	find: function(seriesCode) {
		var opts = {
			path: defaultOptions.path + '/' + seriesCode,
			notCatch: true
		};

		return this.get(opts);
	}
});

module.exports = ModelModel;