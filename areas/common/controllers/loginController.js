"use strict";

let gu = require('guthrie-js');
let co = require('co');
let utils = require('../../../core/utils');
let serverConfig = require('../../../config');
let masterController = require('../../../common/masterController');
let loginController = new gu.controller.inherit(masterController);
let LoginModel = require('../../../models/common/LoginModel');

let defaultOpts = {
  server: serverConfig.serverMap.coreServer
};

// public actions
loginController.actions = {
  index: {
    GET: function(req, res) {

      res.render('login/index');
    },
    POST: function* (req, res) {

      let loginModel = new LoginModel(req, res);
      let result = yield loginModel.checkIsDisabledUser();

      if (result.isDisabled) {

        let errorInfo = loginModel.createErrorInfo(result.data);

        loginModel.loginFailure(res, 600, errorInfo);
      } else {

        let body = req.body;
        let options = Object.assign({}, defaultOpts, {
          path: '/user/login?usr=' + body.usr + '&pwd=' + body.pwd + '&db=' + body.database,
          data: body
        });
        let data = yield loginModel.post(options, true);

        loginModel.loginHandler(data.res, res, req, data.body, body, false);
      }
    }
  },

  dmsLogin: {
    GET: function(req, res) {
      let self = this;

      let usr = req.query.usr || '',
        pwd = req.query.pwd || '',
        lang = req.query.lang || '',
        database = req.query.database || '';

      let options = Object.assign({}, defaultOpts, {
        path: '/user/login?usr=' + usr + '&pwd=' + pwd,
        method: 'POST',
        data: {
          usr: usr,
          pwd: pwd,
          lang: lang,
          database: database
        }
      });

      self.callParentRequest(options, function(data, response) {
        loginHandler(response, res, req, data, options.data, true, self);
      });
    }
  },

  epcmLogin: {
    POST: function(req, res) {
      let token = req.body.token;

      if (token && utils.isRightToken(token)) {

        let redisSessions = req.session.getRedisSessionsModule();

        redisSessions.get({
          app: serverConfig.redisSession.app,
          token: utils.deflateToken(token)
        }, function(err, data) {

          if (err) {
            err.publish();
          }

          if (data.id) {

            res.status(200);
            res.send({
              result: serverConfig.localServerUrlMap.index + '?token=' + token
            });

          } else {

            res.status(401);
            res.send({
              message: '未授权，EPCM登录失败！'
            });

          }
        });
      } else {
        res.status(403);
        res.send({
          message: ' 禁止访问！'
        });
      }
    }
  },

  getDatabase: {
    GET: function* (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/db-config/select'
      });

      let loginModel = new LoginModel(req, res);
      let data = yield loginModel.get(options);

      res.send(data);
    }
  },

  getLangData: {
    GET: function* (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/lang/select'
      });

      let loginModel = new LoginModel(req, res);
      let data = yield loginModel.get(options);

      res.send(data);
    }
  },

  disableUserLogin: {
    POST: function* (req, res) {
      let loginModel = new LoginModel(req, res);

      yield loginModel.disableUserLogin(req.body.usr);

      res.send({});
    }
  }
};

module.exports = loginController;