var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var vehicleController = new gu.controller.inherit(masterController);

vehicleController.actions = {
    index: {
        GET: function(req, res) {
        	var arg = req.query;
            var options = {
                path: '/vin/vehicle/' + arg.vehicleCode
            };

            this.callParentRequest(options, function(data) {
                var finalData, code;
                if(res.statusCode == 200 || res.statusCode == 204) {
                    code = 200;
                    data = data['vehicleCode'] ? data : null;
                    finalData = {
                        success: true,
                        data: data
                    };
                } else {
                    code = res.statusCode;
                    finalData = data;
                }
                res.status(code);
                res.json(finalData);
            });
        }
    }
};

module.exports = vehicleController;