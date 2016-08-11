var fs = require('fs');
var path = require('path');
var gu = require('guthrie-js');
var utils = require('../core/utils');
var serverConfig = require('../config');
var initViewBag = require('../common/initViewBag');
var baseController = new gu.controller.create();
var redisHandler = require('../core/redisHandler');
var NO_VALID_URLS = ['/login', '/pwdInfo', '/error/sessionLocked'];

baseController.on('actionExecuting', function(req, res, next) {
  // 初始化viewbag
  initViewBag.apply(this, [req, res, next]);

  // 判断是否需要免验证
  if (isDontNeedValid(req.url) || req.url === '/') {

    if (isLoginPage(req.url) && req.session.id) {
      res.redirect('/epc/catalog');
      return;
    }
    next();
    return;
  }

  // 判断会话id是否已存在
  if (req.session.id) {
    // 检查当前用户是否在其他地方登录
    hasOtherUserLogin(req.session.id, function(isHas) {

      // 确认用户在其他地方登录
      if (isHas) {
        req.session.destroy(function(err) {
          if (err) {
            err.publish();
          }
          if (req.xhr) {
            res.status(611);
            res.send({
              message: '/error/sessionLocked'
            });
          } else {
            res.redirect('/error/sessionLocked');
          }
        });
      } else {
        if (req.url.startsWith('/epc/catalog?token=') && utils.isRightToken(req.query.token)) {
          res.redirect('/epc/catalog');
        } else {
          utils.rememberCookie(res, req);
          next();
        }
      }
    });

    return;
  }

  // 从epcm跳转过来, 会话不存在, 根据token则重新建立会话
  if (req.url.startsWith('/epc/catalog?token=') && utils.isRightToken(req.query.token)) {
    var redisSessions = req.session.getRedisSessionsModule();

    redisSessions.get({
      app: serverConfig.redisSession.app,
      token: utils.deflateToken(req.query.token)
    }, function(err, data) {

      if (err) {
        err.publish();
      }

      if (data.id) {
        req.session.upgrade(data.id, function() {

          if (data.d) {
            Object.assign(req.session, data.d);
          }

          res.redirect('/epc/catalog');

        });
      } else {
        res.status(401);
        res.send({
          message: '未授权，EPCM登录失败！'
        });
      }
    });

    return;
  }

  // 判断是否是xmlhttprequest请求
  if (req.xhr) {
    res.status(401);
    res.send({
      message: '未授权，EPC登录失败！'
    });
  } else {
    req.url == '/' ? res.redirect('/login') : res.redirect('/login?returnUrl=' + req.url);
  }

});

function isDontNeedValid(url) {
  return NO_VALID_URLS.some(function(element) {
    return url.indexOf(element) === 0 ? true : false;
  });
}

function isLoginPage(url) {
  return url.split('?')[0].endsWith('/login') || url === '/';
}

function hasOtherUserLogin(sid, callback) {
  var key = "EU:" + sid;

  (function(key, callback) {
    redisHandler.getKey(key, function(data) {
      var isHas = data ? true : false;

      redisHandler.delKey(key, function() {
        callback && callback.apply(null, [isHas]);
      });
    });
  })(key, callback);
}

module.exports = baseController;