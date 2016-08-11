/*
 name: jQuery ajax
 desc: Packaging the jquery ajax method
*/
define(["dialog", "json2"], function(Dialog) {

	var i18n = {
		"zh": {
			"100": "未知错误",
			"101": "被请求的页面需要用户名和密码",
			"102": "请求未完成,服务器遇到不可预知的情况"
		},
		"en": {
			"100": "Unknown error",
			"101": "The requested page needs a username and password",
			"102": "The request was not completed, the server encounters unpredictable circumstances"
		}
	};

	var isJsonString = function(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	var trans = i18n[globalConfig.context.lang || "zh"];

	var defaultOpts = {
		cache: true,
		data: {},
		timeout: 60000,
		dataType: "json",
		type: "get",
		traditional: false,
		jsonp: 'callback',
		jsonpCallback: ''
	};

	return {
		/**
		 * To encapsulate the jquery ajax main method.
		 * @param {object} options is ajax configuration parameters.
		 * @return {object} Throw an XHR object.
		 */
		"invoke": function(options) {
			var self = this,
				opts = $.extend({}, defaultOpts, options || {}),
				jqXHR = $.ajax({
					url: opts.url,
					contentType: opts.contentType,
					type: opts.type,
					cache: opts.cache,
					data: opts.data,
					timeout: opts.timeout,
					dataType: opts.dataType,
					beforeSend: opts.beforeSend,
					complete: opts.complete,
					traditional: opts.traditional,
					jsonp: opts.jsonp,
					jsonpCallback: opts.jsonpCallback,
					success: function(root) {
						self.success(opts, root);
					},
					error: function(error) {
						self.error(opts, error);
					}
				});

			return jqXHR;
		},

		/**
		 * The callback function called ajax request is success.
		 * @param {object} options is ajax configuration parameters.
		 * @param {object} The server returns the result
		 */
		"success": function(options, root) {
			var self = this,
				root = root || {};
			debugger;
			if (typeof options.success === 'function') {
				options.success.apply(self, [root]);
			}
		},

		/**
		 * The callback function called ajax request is error.
		 * @param {object} options is ajax configuration parameters.
		 * @param {object} The server returns the error info
		 */
		"error": function(options, error) {
			var self = this,
				responseText = error.responseText,
				statusCode = error.status;

			switch (statusCode) {
				case 0:
					break;
				case 302:
					location.href = location.href;
					break;
				case 401:
					new Dialog({
						type: 'error',
						content: trans["101"],
						onConfirm: function() {
							location.href = location.href;
						}
					});
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
						new Dialog({
							type: 'error',
							content: error.message
						});
					}
					break;
			}
		}
	};
});