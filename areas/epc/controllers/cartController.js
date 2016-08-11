var gu = require('guthrie-js');
var masterController = require('../../../common/masterController');
var cartController = new gu.controller.inherit(masterController);

cartController.actions = {
    index: {
        GET: function(req, res) {
            res.render('cart/index');
        }
    },
    operation: {
        GET: function (req, res) {
            var options = {
                path: '/shoppingcart/all',
                noCache: true
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        },
        POST: function (req, res) {
            var options = {
                path: '/shoppingcart/change-qty',
                method: 'POST',
                data: req.body
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        },
        PUT: function (req, res) {
            var options = {
                path: '/shoppingcart/add',
                method: 'POST',
                data: req.body
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        },
        DELETE: function (req, res) {
            var options = {
                path: '/shoppingcart/delete',
                method: 'POST',
                data: req.body
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },
    query: {
        GET: function(req, res) {
            var options = {
                noCache: true,
                path: '/shoppingcart/query-page?args=' + req.query.args
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },
    exportsFile: {
        GET: function(req, res) {
            var options = {
                path: '/shoppingcart/export',
                res: res,
                contentType: 'application/octet-stream',
                noCache: true
            };

            this.callParentRequest(options, function(response) {
                return response;
            });
        }
    }
};

module.exports = cartController;