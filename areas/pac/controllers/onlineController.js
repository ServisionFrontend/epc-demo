var gu = require('guthrie-js');
var masterController = require('../../../common/masterController');
var urlencode = require('urlencode');
var serverConfig = require('../../../config');
var utils = require('../../../core/utils');
var onlineController = new gu.controller.inherit(masterController);
var moment = require('moment');

var defaultOpts = {
    server: serverConfig.serverMap.coreServer
};

onlineController.actions = {
    'index': {
        GET: function(req, res) {
            res.render('pac/online/index');
        }
    },
    myquestion: {
        GET: function(req, res) {
            res.render('pac/online/myquestion');
        }
    },
    question_search: {
        GET: function(req, res) {
            res.render('pac/online/question_search');
        }
    },
    detail: {
        GET: function(req, res) {
            var questionCode = req.query.questionCode,
                usercode = req.session.usercode || '';

            var options = Object.assign({}, defaultOpts, {
                path: '/question/get?questionCode=' + questionCode,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.render('pac/online/detail', {
                    data: data,
                    createdOn: moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss'),
                    usercode: usercode,
                });
            });
        }
    },
    brand: {
        GET: function(req, res) {
            var options = Object.assign({}, defaultOpts, {
                path: "/combo/brand/list",
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },

    series: {
        GET: function(req, res) {

            var options = Object.assign({}, defaultOpts, {
                path: "/combo/series/list?parentCode=" + req.query.parentCode,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.json(data);
            });
        }
    },

    'brandGroups': {
        GET: function(req, res) {
            var options = Object.assign({}, defaultOpts, {
                path: '/catelog/groups?seriesCode=' + req.query.code,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'questionType': {
        GET: function(req, res) {
            var options = Object.assign({}, defaultOpts, {
                path: '/question/type/list',
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'seriousStatus': {
        GET: function(req, res) {
            var options = Object.assign({}, defaultOpts, {
                path: '/question/important/list',
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'questionStatus': {
        GET: function(req, res) {
            var options = Object.assign({}, defaultOpts, {
                path: '/question/status/list',
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'serviceInfo': {
        GET: function(req, res) {
            var username = req.session.usercode;

            var options = Object.assign({}, defaultOpts, {
                path: '/enterprise/name?username=' + username,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'getPublicQuestion': {
        GET: function(req, res) {
            var args = req.query.args;

            var options = Object.assign({}, defaultOpts, {
                path: '/question/list-public',
                method: 'POST',
                data: args
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'getMyQuestion': {
        GET: function(req, res) {
            var args = req.query.args;

            var options = Object.assign({}, defaultOpts, {
                path: '/question/list-my',
                method: 'POST',
                data: args
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'replyHistory': {
        GET: function(req, res) {
            var questionCode = req.query.questionCode;

            var options = Object.assign({}, defaultOpts, {
                path: '/answer/get?questionCode=' + questionCode,
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'getQualityList': {
        GET: function(req, res) {
            var options = Object.assign({}, defaultOpts, {
                path: '/question/quality/list',
                noCache: true
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    'uploadQuestionFile': {
        POST: function(req, res) {
            var self = this;
            var body = utils.parseBody(req);

            var options = Object.assign({}, defaultOpts, {
                path: '/question',
                method: 'POST',
                data: body.fields,
                files: body.files
            });

            var uploadOptions = {
                maxSize: 4 * 1024 * 1024,
                sizeMessage: '文件大小必须小于等于4M'
            };

            if (!utils.checkMutipleUploadFile(body.files, uploadOptions, res)) {
                return;
            }

            self.callParentRequest(options, function(data) {
                res.set('Content-Type', 'text/html').send(data);
                utils.removeUploadFile(body.files);
            });
        }
    },

    'uploadReplyForm': {
        POST: function(req, res) {
            var self = this;
            var body = utils.parseBody(req);

            var options = Object.assign({}, defaultOpts, {
                path: '/answer',
                method: 'POST',
                data: body.fields,
                files: body.files
            });

            var uploadOptions = {
                maxSize: 4 * 1024 * 1024,
                sizeMessage: '文件大小必须小于等于4M'
            };

            if (!utils.checkMutipleUploadFile(body.files, uploadOptions, res)) {
                return;
            }

            self.callParentRequest(options, function(data) {
                res.set('Content-Type', 'text/html').send(data);
                utils.removeUploadFile(body.files);
            });
        }
    },

    'closeQuestion': {
        POST: function(req, res) {
            var body = req.body;

            var options = Object.assign({}, defaultOpts, {
                path: '/question/close',
                method: 'PUT',
                data: body
            });

            this.callParentRequest(options, function(data) {
                res.send(data);
            });
        }
    },

    download: {
        GET: function(req, res) {
            var arg = req.query.arg,
                filename = req.query.filename;

            var options = Object.assign({}, defaultOpts, {
                url: arg,
                res: res,
                noCache: true
            });

            this.callParentRequest(options, function(response) {
                var tempFileName = urlencode(filename ? filename : 'temp.txt');

                response.set('content-disposition', 'attachment; filename=' + tempFileName);
                return response;
            });
        }
    }
};

module.exports = onlineController;