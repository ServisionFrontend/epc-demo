var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var printController = new gu.controller.inherit(masterController);

printController.actions = {
    index: {
        GET: function(req, res) {
        	var arg = req.query,
                urlPath = '/catelog/usage?seriesCode=' + (arg.seriesCode || '') + '&modelGroupCode=' + (arg.modelGroupCode || '') + '&modelCode=' + (arg.modelCode || '') + '&imageCode=' + (arg.imageCode || ''),
                options = {
	                path: urlPath,
	            };

            this.callParentRequest(options, function(data) {
                res.view({
	        		gifUrl: arg.gifFile,
	        		parts: data
	        	});
            });
        }
    }
};

module.exports = printController;