var gu = require('guthrie-js');
var serverConfig = require('../config');
var redisHandler = require('../core/redisHandler');
var doRequest = require('../core/doRequest');
var baseController = require('./baseController');
var masterController = new gu.controller.inherit(baseController);
var defaultOpts = {
	server: serverConfig.serverMap.epcServer,
	method: 'GET',
	contentType: 'application/json'
};

masterController.on('actionExecuting', function(req, res, next) {

	this.callParentRequest = function(options, callback) {
		var opts = Object.assign({
			req: req
		}, defaultOpts, options);

		if (opts.method === 'GET' && opts.noCache !== true) {
			redisHandler.get(req, function(data) {
				if (data) {
					if (typeof callback === 'function') {
						callback(data)
					}
					return;
				}
				doRequest(opts, function(response, body) {
					if (typeof callback === 'function') {
						res.status(response && response.statusCode || 200);
						callback(body, response)
					}
					if (body.success) {
						redisHandler.set(req, body);
					}
				});
			});
		} else {
			doRequest(opts, function(response, body) {
				if (typeof callback === 'function') {
					if (opts.res) {
						return callback && callback(response);
					} else {
						res.status(response && response.statusCode || 200);
						callback(body, response)
					}
				}
			});
		}
	}

	next();
});


module.exports = masterController;