define(['ajax', 'dialog', 'jquery', 'jqExtend'], function (ajax, Dialog) {

	var ModifyPassword = function () {
		this.init();
	};

	ModifyPassword.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#modify-password-dialog');
			self.$oldPassword = self.$dialog.find('[data-id=old-password]');
			self.$newPassword = self.$dialog.find('[data-id=new-password]');
			self.$confirmPassword = self.$dialog.find('[data-id=confirm-password]');
			self.$submit = self.$dialog.find('[data-id=submit]');
			self.$cancel = self.$dialog.find('[data-id=cancel]');
			self.$tip = self.$dialog.find('[data-id=tip]');
		},

		bindEvent: function () {
			var self = this;

			self.$submit.click(function () {
				if(self.validatePermission() && self.validate()) {
					self.submit();
				}
			});

			self.$cancel.click(function () {
				$.hideBlockUI({
					message: self.$dialog,
					name: 'modify-password'
				});
			});
		},

		validatePermission: function () {
			var self = this,
				userType = pageConfig.userType,
				isDmsUser = userType && userType === 1 ? true : false;

			if(isDmsUser) {
				self.showDialog('error', 'DMS用户不能修改密码');
				return false;
			} else {
				return true;
			}
		},

		validate: function () {
			var self = this;

			if(!self.validateSingle(self.$oldPassword)) {
				self.$oldPassword.focus();
				return false;
			}
			if(!self.validateSingle(self.$newPassword)) {
				self.$newPassword.focus();
				return false;
			}
			if(!self.validateSingle(self.$confirmPassword)) {
				self.$confirmPassword.focus();
				return false;
			}
			if(self.$newPassword.val() != self.$confirmPassword.val()) {
				self.showTips('error', '新密码与确认密码不一致');
				return false;
			}
			if(self.$oldPassword.val() === self.$newPassword.val()) {
				self.showTips('error', '新密码与原密码不能相同');
				return false;
			}

			return true;
		},

		validateSingle: function ($target) {
			var self = this,
				val = $target.val(),
				label = $target.attr('data-label'),
				reg = $target.attr('data-reg'),
				regExp = new RegExp(reg),
				message;

			if(val.length === 0) {
				self.showTips('error', '请输入' + label);
				$target.focus();
				return false;
			}
			if(reg) {
				if(!regExp.test(val)) {
					message = $target.attr('data-message');
					self.showTips('error', message);
					return false;
				}
			}

			self.hideTips();
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
				params = {'oldpwd': self.$oldPassword.val(), 'newpwd': self.$newPassword.val()};
				
			ajax.invoke({
				url: '/common/modifyPassword',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(params),
				success: function (root) {
					if(root.success) {
						self.showDialog('ok', '密码修改成功', function () {
							window.location.reload();
						});
					} else {
						self.showDialog('error', '密码修改失败：' + (root.message || '未知错误'));
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
					if(typeof callback === 'function') callback();
				}
			});
		},

		open: function () {
			var self = this;

			$.showBlockUI({
				message: self.$dialog,
				name: 'modify-password'
			});
		},

		//外部使用方法，用以弹出密码框，用户必须修改密码才能继续使用，根据pageConfig里的needChangePassword判断是否弹出
		mustMoidfyPassword: function () {
			var self = this;

			self.open();
			self.$dialog.find('.layer-close-btn').hide();
			self.$cancel.hide();
			self.$tip.removeClass('hide');
			$(document).off('keyup.modify-password');
		}

	};

	return ModifyPassword;

});