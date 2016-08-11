var gu = require('guthrie-js');
var masterController = require('../../../common/masterController');
var serverConfig = require('../../../config');
var surveyController = new gu.controller.inherit(masterController);

var defaultOpts = {
    server: serverConfig.serverMap.coreServer
};

surveyController.actions = {
    'detail': {
        GET: function(req, res) {
            var id = req.params.id;
            var options = Object.assign({}, defaultOpts, {
                path: '/questionnaire/detail/' + id,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.render('pac/survey/index', {
                    usercode: req.session.usercode,
                    data: data,
                    answered: data.answerCode ? true : false
                });
            });
        }
    },
    'edit': {
        GET: function(req, res) {
            var id = req.params.id;
            var options = Object.assign({}, defaultOpts, {
                path: '/questionnaire/detail/' + id,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.render('pac/survey/index', {
                    usercode: req.session.usercode,
                    data: data,
                    answered: data.answerCode ? true : false
                });
            });
        }
    },
    'answer': {
        POST: function(req, res) {
            var body = req.body;

            var options = Object.assign({}, defaultOpts, {
                path: '/questionnaire/answer',
                method: 'POST',
                data: body
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    }
};

module.exports = surveyController;