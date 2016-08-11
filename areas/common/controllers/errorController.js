var gu = require('guthrie-js');
var baseController = require('../../../common/baseController');
var errorController = new gu.controller.inherit(baseController);

errorController.actions = {
	index: {
		GET: function(req, res) {
			res.render('error/404');
		}
	},
	'404': {
		GET: function(req, res) {
			res.render('error/404');
		}
	},
	'500': {
		GET: function(req, res) {
			res.render('error/500');
		}
	},
	'epcmError': {
		GET: function(req, res) {
			res.render('error/epcmError');
		}
	},
	'sessionLocked': {
		GET: function(req, res) {
			res.render('error/sessionLocked');
		}
	}
};

module.exports= errorController;
