define(['ajax', 'dialog', 'jquery', 'jqExtend'], function (ajax, Dialog) {

	var ModifyEmail = function () {
		this.init();
	};

	ModifyEmail.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#modify-email-dialog');
			self.$password = self.$dialog.find('[data-id=login-password]');
			self.$email = self.$dialog.find('[data-id=confirm-email]');
			self.$submit = self.$dialog.find('[data-id=submit]');
			self.$cancel = self.$dialog.find('[data-id=cancel]');
			self.$tip = self.$dialog.find('[data-id=tip]');
		},

		bindEvent: function () {
			var self = this;

			self.$password.keyup(function () {
				self.hideTips();
			});

			self.$email.keyup(function () {
				self.hideTips();
			});

			self.$submit.click(function () {
				if(self.validate()) {
					self.submit();
				}
			});

			self.$cancel.click(function () {
				$.hideBlockUI({
					message: self.$dialog,
					name: 'modify-email'
				});
			});
		},

		validate: function () {
			var self = this,
				password = $.trim(self.$password.val()),
				email = $.trim(self.$email.val()),
				pattern = new RegExp(self.$email.attr('data-reg'));

			if(password.length === 0 || password.length < 5 || password.length > 18) {
				self.showTips('error', '请输入6-18位的登录密码');
				self.$password.focus();
				return false;
			}
			if(email.length === 0) {
				self.showTips('error', '请输入邮箱');
				self.$email.focus();
				return false;
			}
			if(!pattern.test(email)) {
				self.showTips('error', '邮箱格式不正确，请重新输入');
				self.$email.focus();
				return false;
			}

			return true;
		},

		showTips: function(type, text) {
			var self = this,
				i = 0;
				types = ['error', 'warn', 'info', 'ok', 'hide'];

			for(; i < types.length; i++) {
				self.$tip.removeClass(types[i]);
			}

			self.$tip.addClass(type).find('.text').text(text);
		},

		hideTips: function () {
			var self = this;

			self.$tip.addClass('hide').find('.text').text('');
		},

		submit: function () {
			var self = this,
				params = {'password': self.$password.val(), 'email': self.$email.val()};
				
			ajax.invoke({
				url: '/common/modifyEmail',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(params),
				success: function (root) {
					if(root.success) {
						self.showDialog('ok', '邮箱修改成功', function () {
							$.hideBlockUI({
								message: self.$dialog,
								name: 'modify-email'
							});
						});
					} else {
						self.showDialog('error', '邮箱修改失败：' + (root.message || '未知错误'));
					}
				},
				failed: function (error) {
					self.showDialog('error', error.message);
				}
			});
		},

		showDialog: function (type, message, callback) {
			var self = this;

			new Dialog({
				type: type,
				content: message,
				onConfirm: function () {
					if(typeof callback === 'function') {
						callback();
					}
				}
			});
		},

		clear: function () {
			var self = this;

			self.$password.val('');
			self.$email.val('');
		},

		open: function () {
			var self = this;

			$.showBlockUI({
				message: self.$dialog,
				name: 'modify-email',
				onUnblock: function () {
					self.clear();
				}
			});
		}

	};

	return ModifyEmail;

});