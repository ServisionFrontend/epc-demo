"use strict";

let gu = require('guthrie-js');
let serverConfig = require('../../../config');
let masterController = require('../../../common/masterController');
let userController = new gu.controller.inherit(masterController);
let BaseModel = require('../../../models/common/BaseModel');
let defaultOpts = {
  server: serverConfig.serverMap.coreServer
};

userController.actions = {
  index: {
    GET: function* (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/user/user-info/' + req.session.usercode,
        noCache: true
      });

      let baseModel = new BaseModel(req, res);
      let data = yield baseModel.get(options);

      res.json(data);
    },

    PUT: function* (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/user/user-info',
        data: req.body
      });

      let baseModel = new BaseModel(req, res);
      let data = yield baseModel.put(options);

      res.json(data);
    }
  }
};

module.exports = userController;