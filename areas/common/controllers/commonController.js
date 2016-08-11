var gu = require('guthrie-js');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var commonController = new gu.controller.inherit(masterController);

var defaultOpts = {
	server: serverConfig.serverMap.coreServer
};

commonController.actions = {
	questionnaireExist: {
		GET: function(req, res) {
			var options = Object.assign({}, defaultOpts, {
				path: '/questionnaire/exist',
				noCache: true
			});

			this.callParentRequest(options, function(data) {
				res.json(data);
			});
		}
	},

	modifyPassword: {
		POST: function(req, res) {
			var user = JSON.parse(req.session.userInfo || '{}').username,
				oldpwd = req.body.oldpwd || '',
				newpwd = req.body.newpwd || '',
				options = Object.assign({}, defaultOpts, {
					server: defaultOpts.server,
					path: '/user/modify-pwd?usr=' + user + '&oldpwd=' + oldpwd + '&newpwd=' + newpwd,
					method: 'PUT'
				});

			this.callParentRequest(options, function(data, response) {
				if (data.success) {
					res.status(200);
					res.json(data);
					req.session.destroyall();
				} else {
					res.json(data);
				}
			});
		}
	},

	modifyEmail: {
		POST: function(req, res) {
			var user = JSON.parse(req.session.userInfo || '{}').username,
				password = req.body.password || '',
				email = req.body.email || '',
				options = {
					server: defaultOpts.server,
					path: '/user/reset-mail?usr=' + user + '&pwd=' + password + '&mail=' + email,
					method: 'PUT'
				};

			this.callParentRequest(options, function(data, response) {
				if (data.success) {
					res.status(200);
					res.json(data);
				} else {
					res.json(data);
				}
			});
		}
	},

	getLangData: {
		GET: function(req, res) {
			var options = Object.assign({}, defaultOpts, {
				path: '/lang/select'
			});

			this.callParentRequest(options, function(data) {
				res.send(data);
			});
		}
	},

	changeLang: {
		GET: function(req, res) {
			var lang = req.query.lang;

			req.session.lang = lang;
			req.session.save();
			res.status(200);
			res.send({});
		}
	},

	getQuestionnaireList: {
		GET: function(req, res) {
			var options = Object.assign({}, defaultOpts, {
				path: '/questionnaire/issued',
				noCache: true
			});

			this.callParentRequest(options, function(data) {
				res.send(data);
			});
		}
	},

	getQusetionnaireCount: {
		GET: function(req, res) {
			var options = Object.assign({}, defaultOpts, {
				path: '/questionnaire/unread',
				noCache: true
			});

			this.callParentRequest(options, function(data) {
				res.send(data);
			});
		}
	}
};

module.exports = commonController;