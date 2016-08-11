/*
 name: pjax interceptor
 desc: pjax 响应统一处理
*/
define(['pjax'], function() {

	if ($.support.pjax) {

		$.pjax.defaults.timeout = 1200;

		$(document).on('pjax:error', function(event, error, status, statusText, options) {
			//debugger;
			handlerError(error, options);
		});
	}

	var isJsonString = function(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	var handlerError = function(error, options) {
		var self = this,
			responseText = error.responseText,
			statusCode = error.status;

		switch (statusCode) {
			case 0:
				break;
			case 401:
				//alert('被请求的页面需要用户名和密码');
				// location.href = location.href;
				break;
			case 611:
				var result = JSON.parse(responseText)
				window.open(result.message, '_self');
				break;
			default:
				error = isJsonString(responseText) ? JSON.parse(responseText) : {
					message: trans["100"]
				};

				if (typeof options.failed === 'function') {
					options.failed.apply(self, [error, statusCode]);
				} else {
					alert(error.message);
				}
				break;
		}
	}
});