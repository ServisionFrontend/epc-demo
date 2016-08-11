require(['ajax', 'mustache', 'jquery', 'cookie', 'jqExtend', 'select', 'domReady!', 'checkbox'], function(ajax, Mustache, $) {
	var logInUrl = "/login",
		catalogUrl = "/epc/catalog",
		disableUserLoginUrl = "/login/disableUserLogin",
		login = {

			init: function() {
				var self = this;

				self.buildDom();
				self.buildAttrs();
				self.buildComponent();
				self.bindEvent();

				self.$account.val($.cookies.get('username'));
			},
			buildDom: function() {
				var self = this;

				self.$container = $('#container');
				self.$btnLogin = $('#btn-login');
				self.$account = $('#account');
				self.$password = $('#password');

				self.$msgBox = $('#msg');
				self.$msg = self.$msgBox.find("[data-msg]");

				self.$databaseSelectWrapper = $('.form-select-database');
				self.$langSelectWrapper = $('.form-select-lang');

				self.$rememberCheck = $('.form-checkbox[data-name="remember"]');
			},

			buildAttrs: function() {
				var self = this;

				self.remember = false;
				self.submiting = false;
			},

			buildComponent: function() {
				var self = this;

				self.getDataBase();
				self.getLang();
			},

			bindEvent: function() {
				var self = this;

				self.$container.on("keyup", "input", function(e) {
					if (e.keyCode === 13) {
						self.submit();
					} else {
						self.hideMsg();
					}
				});
				self.$btnLogin.on('click', function() {
					self.submit();
				});
				self.$password.on('focus', function () {
					this.type = 'password';
				});
			},

			getDataBase: function() {
				var self = this;

				ajax.invoke({
					url: '/login/getDatabase',
					type: 'GET',
					success: function(data) {
						self.renderData(self.$databaseSelectWrapper, data);
					}
				});
			},

			renderData: function($dom, data) {
				var self = this;

				var template = $dom.find('.template').html(),
					html;

				html = Mustache.render(template, {
					data: data
				});
				$dom.find('.form-select-option-list').html(html);
				$dom.find('.form-select-text').text(data[0].name).attr('title', data[0].name);
				$dom.find('.form-select-input').val(data[0].code);
			},

			getLang: function() {
				var self = this;

				ajax.invoke({
					url: '/login/getLangData',
					type: 'GET',
					success: function(data) {
						self.renderData(self.$langSelectWrapper, data);
					}
				});
			},

			submit: function() {

				if (this.submiting) return;

				var self = this,
					data = self.$container.selectElByField(),
					rst = self.validata(data);

				$.cookies.set('username', (data && data.usr) || '', {hoursToLive: 24 * 7});

				self.remember = self.$rememberCheck.hasClass('checked') ? true : false;

				if (rst.success) {
					self.launch($.extend(true, {}, data, {
						remember: self.remember
					}));
				} else {
					self.showMsg(rst.msg);
				}
			},

			validata: function(data) {
				var self = this,
					rst = {
						success: true,
						msg: ''
					};
				if ($.trim(data.usr) === "") {
					rst.success = false;
					rst.msg = "帐号为必填项";
					self.$account.focus();
				} else if ($.trim(data.pwd) === "") {
					rst.success = false;
					rst.msg = "密码为必填项";
					self.$password.focus();
				}

				return rst;
			},

			launch: function(data) {
				var self = this,
					returnUrl;

				ajax.invoke({
					url: logInUrl,
					type: 'post',
					contentType: 'application/json',
					data: JSON.stringify(data),
					beforeSend: function() {
						self.submiting = true;
						self.$btnLogin.val('登录中...');
					},
					success: function(res) {
						$.cookies.del(data.usr);

						window.location.href = self.getReturnUrl();
					},
					failed: function(err, statusCode) {
						var count;
						self.submiting = false;
						self.$btnLogin.val('登录');

						if (!(statusCode === 600) && err.data) {
							self.rememberFailed(data);
							count = $.cookies.get(data.usr) || 5;
							err.message += ', 您还有' + (6 - count) + '次登录机会';
						}

						self.showMsg(err.message);
					}
				});
			},

			rememberFailed: function(data) {
				var self = this,
					count = $.cookies.get(data.usr) || 0;

				if (count < 4) {
					$.cookies.set(data.usr, ++count);
				} else {
					ajax.invoke({
						url: disableUserLoginUrl,
						type: 'post',
						contentType: 'application/json',
						data: JSON.stringify({
							usr: data.usr
						})
					});
					$.cookies.del(data.usr);
				}
			},

			getReturnUrl: function() {
				var self = this,
					search = window.location.search,
					index = search.indexOf('returnUrl'),
					url = search.substring(index + 10); // returnUrl= 10个字符串

				if (url === '/' || url === '/login') {
					url = catalogUrl;
				}
				return index > -1 ? url : catalogUrl;
			},

			showMsg: function(msg) {
				var self = this;
				self.$msgBox.stop(false, true).fadeIn();
				self.$msg.html(msg);
			},

			hideMsg: function() {
				var self = this;
				self.$msgBox.stop(false, true).fadeOut();
			}
		};

	login.init();

});