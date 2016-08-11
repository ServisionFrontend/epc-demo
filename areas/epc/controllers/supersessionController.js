var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var supersessionController = new gu.controller.inherit(masterController);

supersessionController.actions = {
    index: {
        GET: function(req, res) {
        	var arg = req.query;
            var partNo = JSON.parse(arg.args).filters.partNo;
            var options = {
                path: '/detail/part-substitute/' + partNo
            };

            this.callParentRequest(options, function(data) {
                res.json({list:data});
            });
        }
    },
    
    getSupersessionDetail: {
        GET: function (req, res) {
            var arg = req.query;
            var options = {
                path: '/detail/part-substitute-detail/' + arg.code
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = supersessionController;