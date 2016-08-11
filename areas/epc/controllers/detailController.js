var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var detailController = new gu.controller.inherit(masterController);

detailController.actions = {
	index: {
		GET: function (req, res) {
			var arg = req.query;
			var options = {
				path: '/detail/part/' + arg.partNo
			};

			this.callParentRequest(options, function(data) {
				res.render('detail/index', {
					partInfo: data || {}
				});
			});		
		}
	},

	getSupplier: {
		GET: function (req, res) {
			var arg = req.query;
			var options = {
				path: '/detail/part-supplier/' + arg.partNo
			};

			this.callParentRequest(options, function(data) {
				res.json({list: data || {}});
			});	
		}
	},

	getSupersession: {
		GET: function (req, res) {
			var arg = req.query;
			var options = {
				path: '/detail/part-substitute/' + arg.partNo
			};

			this.callParentRequest(options, function(data) {
				res.json({list: data || []});
			});	
		}
	},

	getKit: {
		GET: function (req, res) {
			var arg = req.query;
			var options = {
				path: '/detail/part-repairkit/' + arg.partNo
			};

			this.callParentRequest(options, function(data) {
				res.json({list: data || []});
			});
		}
	},
	
	getKitDetail: {
		GET: function (req, res) {
			var arg = req.query;
			var options = {
				path: '/detail/part-repairkit-detail?args=' + arg.args
			};

			this.callParentRequest(options, function(data) {
				res.json(data || {});
			});
		}
	}
};

module.exports = detailController;