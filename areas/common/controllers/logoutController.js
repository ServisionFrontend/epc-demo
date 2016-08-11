var gu = require('guthrie-js');
var config = require('../../../config');
var doRequest = require('../../../core/doRequest');
var baseController = require('../../../common/baseController');
var logoutController = new gu.controller.inherit(baseController);

logoutController.actions = {
    index: {
        GET: function(req, res) {
            req.session.destroyall(function(err, result) {
                if (err) {
                    err.publish();
                }
                res.redirect('/login');
            });
        }
    }
};

module.exports = logoutController;

