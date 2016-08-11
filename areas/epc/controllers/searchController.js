var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var searchController = new gu.controller.inherit(masterController);

searchController.actions = {
    vinSearch: {
        GET: function (req, res) {
            var arg = req.query;
            var options = {
                path: '/vin/vin/' + arg.vin
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = searchController;
