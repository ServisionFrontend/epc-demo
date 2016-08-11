"use strict";

var gu = require('guthrie-js');
var doRequest = require('../../../core/doRequest');
var serverConfig = require('../../../config');
var masterController = require('../../../common/masterController');
var knowledgeController = new gu.controller.inherit(masterController);

knowledgeController.actions = {
  index: {
    GET: function (req, res) {
      var regex = /\$\{brandCode\}/g;
      var brandCode = req.session.brandCode || '';

      this.viewBag().jsonpUrl = serverConfig.jsonpUrl.replace(regex, brandCode);

      res.render('knowledge/index');
    }
  }
};

module.exports = knowledgeController;