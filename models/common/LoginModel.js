"use strict";

let util = require('util');
let co = require('co');
let BaseModel = require('./BaseModel');
let config = require('../../config');
let authCode = require('../../common/authCode');
let redisHandler = require('../../core/redisHandler');
let utils = require('../../core/utils');

util.inherits(LoginModel, BaseModel);

function LoginModel(req, res, options) {
  let self = this;

  BaseModel.apply(this, [req, res, options]);

  this.className = 'LoginModel';


  this.checkIsDisabledUser = function () {
    let user = self.context.req.body.usr;
    let hashKey = hashUserKey(user);

    return new Promise(function (resolve, reject) {
      redisHandler.getKey(hashKey, function(data) {
        if (data) {
          resolve({
            isDisabled: true,
            data: data.startDate
          });
        } else {
          resolve({
            isDisabled: false,
            data: null
          });
        }
      });
    });
  };

  this.createErrorInfo = function (data) {
    let nowDate = new Date();
    let startDate = new Date(data);
    let minute = Math.round(60 - ((nowDate - startDate) / 1000) / 60);

    return {
      message: '密码输入错误5次该账号已冻结, ' + minute + '分钟后尝试重新登录',
      data: null,
      success: false
    };
  };

  this.loginHandler = function (response, res, req, data, body, isDmsLogin) {
    let statusCode;

    if (response.statusCode === 200) {
      self.loginSuccess(response, res, req, data, body, isDmsLogin)
    } else {
      statusCode = response && response.statusCode || 200;
      self.loginFailure(res, statusCode, data, isDmsLogin);
    }
  };


  this.loginSuccess = function (response, res, req, data, body, isDmsLogin) {

    co(function * () {

      let result = yield checkIsLogined(req, body.usr);
      // 该用户已登录，且不是同一浏览器重复登录
      if (result.sessions.length > 0) {
        yield flagExistSessionId(req, body.usr);
      }
      yield createSession(req, body.usr);

      req.session.hasLogined = true;
      req.session.usercode = body.usr;
      req.session.lang = body.lang;
      req.session.database = body.database;
      req.session.brandCode = data.logoBrandCode;
      req.session.userInfo = JSON.stringify(data);
      req.session.authCodes = JSON.stringify(authCode.pickAuthor(data.authCodes || []));
      req.session.toEpcmUrl = config.toEpcmUrl + '/?token=' + utils.inflateToken(req.session.id);
      req.session.sid = req.session.id;
      req.session.remember = body.remember;

      res.status(200);

      isDmsLogin ? res.redirect('/epc/catalog') : res.send({});
    }).catch(function(err) {
      err && err.publish();
    });
  };

  this.loginFailure = function (res, statusCode, data, isDmsLogin) {
    res.status(statusCode);

    isDmsLogin ? res.redirect('/epc/catalog') : res.send(data);
  };

  this.disableUserLogin = function (user) {
    let data = {
      startDate: new Date()
    };
    let expireTime = 60 * 60;
    let hashKey = hashUserKey(user);

    return new Promise(function (resolve, reject) {
      redisHandler.setKey(hashKey, JSON.stringify(data), expireTime, function() {
        resolve();
      });
    });
  };

}


function hashUserKey(str) {
  let hashKey = redisHandler.hashKey(str);

  return 'DU:' + hashKey;
}

function checkIsLogined(req, username) {
  let redisSessions = req.session.getRedisSessionsModule();

  return function(callback) {
    redisSessions.soid({
      app: config.redisSession.app,
      id: username
    }, callback);
  };
}

function flagExistSessionId(req, username) {
  let redisSessions = req.session.getRedisSessionsModule();

  return function(callback) {
    redisSessions.soid({
      app: config.redisSession.app,
      id: username
    }, function(err, resp) {
      if (!err) {
        if (resp.sessions && resp.sessions.length && resp.sessions[0].d && resp.sessions[0].d.sid) {
          setSid(resp.sessions[0].d.sid);
        }
      } else {
        err.publish();
      }

      callback && callback.apply();
    });
  };
}

function setSid(sid) {
  let data = {
      startDate: new Date()
    };
  let key = 'EU:' + sid;
  let expireTime = (60 * 60) * 24;

  redisHandler.setKey(key, JSON.stringify(data), expireTime);
}

function createSession(req, username) {

  return function(callback) {
    req.session.upgrade(username, '172800', callback);
  }
}

module.exports = LoginModel;