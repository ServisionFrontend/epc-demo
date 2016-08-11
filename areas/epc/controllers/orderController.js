var gu = require('guthrie-js');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var orderController = new gu.controller.inherit(masterController);

orderController.actions = {
    index: {
        GET: function(req, res) {
            res.render('order/index');
        }
    },

    query: {
        GET: function (req, res) {
            var arg = req.query;
            var options = {
                path: '/order/query-page?args=' + arg.args
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },

    deleteOrder: {
       POST: function (req, res) {
            var options = {
                path: '/order/delete',
                method: 'POST',
                data: req.body
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = orderController;