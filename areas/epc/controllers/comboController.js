var gu = require('guthrie-js');
var masterController = require('../../../common/masterController');
var comboController = new gu.controller.inherit(masterController);

comboController.actions = {
	brand: {
		GET: function(req, res) {
			var options = {
				path: "/combo/brand/list",
				noCache: true
			};

			this.callParentRequest(options, function(data) {
				res.json({
					'list': data
				});
			});
		}
	},

	series: {
		GET: function(req, res) {
			var options = {
				path: "/combo/series/list?parentCode=" + req.query.parentCode,
				noCache: true
			};

			this.callParentRequest(options, function(data) {
				res.json({
					'list': data
				});
			});
		}
	},

	model: {
		GET: function(req, res) {
			var options = {
				path: "/combo/model-group/list?parentCode=" + req.query.parentCode
			};

			this.callParentRequest(options, function(data) {
				res.json({
					'list': data
				});
			});
		}
	},

	subModel: {
		GET: function(req, res) {
			var options = {
				path: "/combo/model/list?parentCode=" + req.query.parentCode,
			};

			this.callParentRequest(options, function(data) {
				res.json({
					'list': data
				});
			});
		}
	},

	group: {
		GET: function(req, res) {
			var options = {
				path: "/combo/group/list?parentCode=" + req.query.parentCode
			};

			this.callParentRequest(options, function(data) {
				res.json({
					'list': data
				});
			});
		}
	},
	
	subGroup: {
		GET: function(req, res) {
			var options = {
				path: "/combo/sub-group/list?parentCode=" + req.query.parentCode,
			};

			this.callParentRequest(options, function(data) {
				res.json({
					'list': data
				});
			});
		}
	}
};

module.exports = comboController;