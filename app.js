var express = require('express');
var path = require('path');
var fs = require('fs');
var os = require('os');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connectRedisSessions = require('connect-redis-sessions');
var gu = require('guthrie-js');
var routesMap = require('./routes/routesMap');
var config = require('./config');
var formidable = require('express-formidable');

require('./core/extendError')();

var app = express();

// 构建发布版本号
config['releaseVersion'] = fs.statSync(path.join(__dirname, 'public/release/scripts')).mtime.getTime();

// 缓存计算机名
config['curServerName'] = os.hostname();

//部署为线上环境
//app.set('env', 'production');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());

// upload file config
app.use(formidable.parse({
	uploadDir: path.join(__dirname, './upload/'),
	keepExtensions: true
}));

// 重写redis session id 规则
var crs = connectRedisSessions(config.redisSession);
crs.handler.rds._VALID['id'] = /^([a-zA-Z0-9_\.-]){1,64}$/;
app.use(crs);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

var router = new gu.Router(app, __dirname);

routesMap(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');

	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		err.publish();
		res.render('error/index', {
			message: err.message,
			error: err,
			viewBag: {
				isLocal: req.query.isDebug === 'true' ? true : false,
				releaseVersion: config['releaseVersion']
			}
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	err.publish();
	res.render('error/index', {
		message: err.message,
		error: {},
		viewBag: {
			isLocal: req.query.isDebug === 'true' ? true : false,
			releaseVersion: config['releaseVersion']
		}
	});
});

module.exports = app;