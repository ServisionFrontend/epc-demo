var gu = require('guthrie-js');
var masterController = require('../../../common/masterController');
var crumbsController = new gu.controller.inherit(masterController);

crumbsController.actions = {
    index: {
        GET: function(req, res) {
            var arg = req.query,
                bc = arg.brandCode || '',
                sc = arg.seriesCode || '',
                mgc = arg.modelGroupCode || '',
                mc = arg.modelCode || '',
                ic = arg.imageCode || '',
                urlPath = '/breadcrumb/info?brandCode=' + bc + '&seriesCode=' + sc + '&modelGroupCode=' + mgc + '&modelCode=' + mc + '&imageCode=' + ic,
                options = {
                    path: urlPath
                };

            if(bc == '') {
                res.status(200);
                res.json({});
                return;
            }

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = crumbsController;