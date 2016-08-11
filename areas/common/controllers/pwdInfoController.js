var gu = require('guthrie-js');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var pwdInfoController = new gu.controller.inherit(masterController);

var defaultOpts = {
	server: serverConfig.serverMap.coreServer
};

pwdInfoController.actions = {
	index: {
		GET: function(req, res) {
			res.render('pwdinfo/index');
		}
	},

	'step_second': {
		GET: function(req, res) {
			res.render('pwdinfo/step_second');
		}
	},

	'step_third': {
		GET: function(req, res) {
			res.render('pwdinfo/step_third');
		}
	},

	'info_error': {
		GET: function(req, res) {
			res.render('pwdinfo/info_error');
		}
	},

	'sendMail': {
		POST: function(req, res) {
			var body = req.body;

			var options = Object.assign({}, defaultOpts, {
				path: '/user/send-reset-pwd-mail?usr=' + body.usr + '&resetUrl=' + body.resetUrl,
				method: 'POST',
				data: body
			});

			this.callParentRequest(options, function(data) {
				res.send(data);
			});
		}
	},

	'verifyMailCode': {
		GET: function(req, res) {
			var code = req.query.code;

			var options = Object.assign({}, defaultOpts, {
				path: '/user/verify-reset-pwd-code?code=' + code,
				noCache: true
			});

			this.callParentRequest(options, function(data) {
				res.send(data);
			});
		}
	},

	'resetPwd': {
		POST: function(req, res) {
			var body = req.body;

			var options = Object.assign({}, defaultOpts, {
				path: '/user/reset-pwd?usr=' + body.usr + '&pwd=' + body.pwd,
				method: 'PUT',
				data: body
			});

			this.callParentRequest(options, function(data) {
				res.send(data);
			});
		}
	}
};

module.exports = pwdInfoController;