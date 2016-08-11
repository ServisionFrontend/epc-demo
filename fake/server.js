var http = require('http');

var server = http.createServer(function(req, res) {
	var data = '';
	req.setEncoding('utf8');

	req.on('data', function(chunk) {
		data += chunk;
	});
	req.on('end', function() {
		switch (req.url) {
			case '/login':
				var user = JSON.parse(data);
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});

				if (user.usercode === 'admin' && user.password === '111111') {
					res.end(JSON.stringify({
						status: 200,
						message: 'ok'
					}));
				} else {
					res.end(JSON.stringify({
						status: 403,
						message: '用户名或密码错误！'
					}));
				}
				break;
			default:
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});

				res.end(JSON.stringify({
					status: 500,
					message: '该接口不存在！'
				}));
		}
	});
});

server.listen(9001);
console.log('server is listening on port 9001 !');