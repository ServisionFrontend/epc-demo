var gu = require('guthrie-js');
var masterController = require('../../../common/masterController');
var advancedSearchController = new gu.controller.inherit(masterController);

advancedSearchController.actions = {
    index: {
        GET: function(req, res) {
            var options = {
                path: '/advanced-search/search?args=' + req.query.args + '&queryLevelCode=' + req.query.queryLevelCode
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = advancedSearchController;