var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var vinController = new gu.controller.inherit(masterController);

vinController.actions = {
    index: {
        GET: function(req, res) {
            var arg = req.query;
            var options = {
                path: '/vin/vin/' + arg.vin
            };

            this.callParentRequest(options, function(data) {
                var finalData, code;
                if(res.statusCode == 200 || res.statusCode == 204) {
                    code = 200;
                    data = data['vinNo'] ? data : null;
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
    },

    vinAutocomplete: {
        GET: function(req, res) {
            var arg = req.query;
            var options = {
                path: '/vin/search?vinNo=' + arg.vinNo
            };

            this.callParentRequest(options, function(data) {
                res.json({
                    list: data
                });
            });
        }
    },
};

module.exports = vinController;