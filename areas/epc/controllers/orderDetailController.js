var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var orderDetailController = new gu.controller.inherit(masterController);

orderDetailController.actions = {
    index: {
        GET: function(req, res) {
            var arg = req.query;
            res.render('order/detail',{
                code: arg.code || ''
            });
        }
    },
    
    query: {
        GET: function (req, res) {
            var arg = req.query;
            var options = {
                path: '/order/query-detail-page?args=' + arg.args
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = orderDetailController;