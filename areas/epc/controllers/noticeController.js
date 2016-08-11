"use strict";

let gu = require('guthrie-js');
let serverConfig = require('../../../config');
let masterController = require('../../../common/masterController');
let noticeController = new gu.controller.inherit(masterController);
let BaseModel = require('../../../models/common/BaseModel');

let defaultOpts = {
  server: serverConfig.serverMap.coreServer
};

noticeController.actions = {
  index: {
    GET: function (req, res) {
      let arg = req.query;

      let options = Object.assign({}, defaultOpts, {
        path: '/message/list',
        method: 'POST',
        data: JSON.parse(arg.args)
      });

      this.callParentRequest(options, function (data) {
        res.json(data);
      });
    }
  },

  setSingleAlready: {
    POST: function (req, res) {
      let arg = req.query;

      let options = Object.assign({}, defaultOpts, {
        path: '/message/mark-read?messageCode=' + req.body.code,
        method: 'PUT',
      });

      this.callParentRequest(options, function (data) {
        res.json(data);
      });
    }
  },

  setAllAlready: {
    GET: function (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/message/mark-all-read',
        method: 'PUT'
      });

      this.callParentRequest(options, function (data) {
        res.json(data);
      });
    }
  },

  getCount: {
    GET: function (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/message/count-unread',
        noCache: true
      });

      this.callParentRequest(options, function (data) {
        res.json(data);
      });
    }
  },

  getType: {
    GET: function* (req, res) {
      let options = Object.assign({}, defaultOpts, {
        path: '/message/type/select'
      });

      let baseModel = new BaseModel(req, res);
      let data = yield baseModel.get(options);

      res.json(data);
    }
  }
};

module.exports = noticeController;