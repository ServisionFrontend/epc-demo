var gu = require('guthrie-js');
var serverConfig = require('../../../config');
var redisHandler = require('../../../core/redisHandler');
var utils = require('../../../core/utils');
var masterController = require('../../../common/masterController');
var deleteCacheController = new gu.controller.inherit(masterController);

deleteCacheController.actions = {
  index: {
    GET: function(req, res) {
      var prefix = req.query.p || serverConfig.redisCache.prefix;
      var pattern = prefix + '*';

      redisHandler.delByPattern(pattern, function(count) {

        res.send({
          message: '删除命令：del ' + pattern + '， 成功删除 ' + count + ' 条数据！'
        });
      });
    }
  }
};


module.exports = deleteCacheController;