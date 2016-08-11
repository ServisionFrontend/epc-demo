var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var modelController = new gu.controller.inherit(masterController);
var utils = require('../../../core/utils');
var request = require('request');

modelController.actions = {
    index: {
        GET: function(req, res) {
            var arg = req.query,
                from = arg.from,
                urlPath;

            if (from == 'vin') {
                urlPath = '/catelog/vin-group-image?vinNo=' + (arg.vinNo || '');
            } else if (from == 'vehicle') {
                urlPath = '/catelog/vehicle-group-image?vehicleCode=' + (arg.vehicleCode || '');
            } else {
                urlPath = '/catelog/model-group-image?seriesCode=' + (arg.seriesCode || '') + '&modelGroupCode=' + (arg.modelGroupCode || '') + '&modelCode=' + (arg.modelCode || '');
            }

            var options = {
                path: urlPath
            };

            this.callParentRequest(options, function(data) {
                res.render('model/index', {
                    groups: data || {}
                });
            });
        }
    },

    getSvg: {
        GET: function(req, res) {
            var arg = req.query;
            var fileServer = serverConfig.partnerApp.fileServer;
            var url = utils.getReplaceUrl(arg.urlPath, fileServer.protocol, fileServer.host, fileServer.port);
            var filenameIdx = url.lastIndexOf("/") + 1;
            url = url.substring(0, filenameIdx) + encodeURIComponent(url.substring(filenameIdx));
            var options = {
                headers: {
                    'Accept-Encoding': 'gzip'
                },
                url: url,
                contentType: 'text/xml',
                timeout: 1000 * 20
            };

            request(options).pipe(res);
        }
    },

    getParts: {
        GET: function(req, res) {
            var arg = req.query,
                from = arg.from,
                urlPath;

            if (from == 'vin') {
                urlPath = '/catelog/vin-usage?vinNo=' + arg.vinNo + '&imageCode=' + arg.imageCode;
            } else if (from == 'vehicle') {
                urlPath = '/catelog/vehicle-usage?vehicleCode=' + arg.vehicleCode + '&imageCode=' + arg.imageCode;
            } else {
                urlPath = '/catelog/model-usage?seriesCode=' + (arg.seriesCode || '') + '&modelGroupCode=' + (arg.modelGroupCode || '') + '&modelCode=' + (arg.modelCode || '') + '&imageCode=' + (arg.imageCode || '');
            }

            var options = {
                path: urlPath
            };

            this.callParentRequest(options, function(data) {
                res.json(data || []);
            });
        }
    },

    print: {
        GET: function(req, res) {
            var arg = req.query,
                urlPath = '/image-print/print?seriesCode=' + (arg.seriesCode || '') + '&modelGroupCode=' + (arg.modelGroupCode || '') + '&modelCode=' + (arg.modelCode || '') + '&imageCode=' + (arg.imageCode || '');

            var options = {
                path: urlPath,
                noCache: true
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },

    getProgress: {
        POST: function(req, res) {
            var arg = req.body,
                urlPath = '/progress/status/' + (arg.id || '');

            var options = {
                path: urlPath,
                noCache: true
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },

    stopPrint: {
        DELETE: function(req, res) {
            var arg = req.body,
                urlPath = '/progress/status/' + (arg.id || '');

            var options = {
                path: urlPath,
                method: 'DELETE',
                noCache: true
            };

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    }
};

module.exports = modelController;