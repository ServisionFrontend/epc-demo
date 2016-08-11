var config = require('../config');
var utils = require('../core/utils');
var authCode = require('../common/authCode');

var initViewBag = function(req, res, next) {
	var userInfo = JSON.parse(req.session.userInfo || '{}');
	this.viewBag().lang = req.session.lang;
	this.viewBag().releaseVersion = config['releaseVersion'];
	this.viewBag().logoBrandCode = userInfo.logoBrandCode || '';
	this.viewBag().logoImgUrl = userInfo.logoImgUrl || '';
	this.viewBag().realname = userInfo.realName || '';
	this.viewBag().username = userInfo.username || '';
	this.viewBag().authCodes = JSON.parse(req.session.authCodes || '{}');
	this.viewBag().hasOperation = authCode.hasOperation;
	this.viewBag().isLocal = config.isLocal || req.query.isDebug === 'true' ? true : false;
	this.viewBag().needChangePassword = userInfo.needChangePassword || false;
	this.viewBag().helpDocUrl = config.helpDocUrl;
	this.viewBag().path = config.path;
	this.viewBag().userType = userInfo.userType || 0;
	this.viewBag().toEpcmUrl = req.session.toEpcmUrl;
	this.viewBag().logDbName = userInfo.logDbName || null;
	this.viewBag().mail = userInfo.mail || '';
};

module.exports = initViewBag;