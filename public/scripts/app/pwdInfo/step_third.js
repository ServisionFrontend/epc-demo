require(['ajax', 'dialog', 'jquery', 'getFormValue'], function(ajax, Dialog) {
	var PwdInfo = {

			init: function() {
				var self = this;
				
				self.initEls();
				self.checkIsValid();
				self.initEvent();
			},

			initEls: function() {
				var self = this;
				
				self.$oldPwd = $('input[name="old-pwd"]');
				self.$newPwd = $('input[name="new-pwd"]');
				self.$userName = $('[data-name="username"]');
				self.$submitBtn = $('[data-action="submit"]');
				self.pwdInfoForm = $('#body_pwdinfo');
			},

			initAttrs: function() {
				var self = this;

				self.canSubmit = false;
			},

			initEvent: function() {
				var self = this;

				self.$oldPwd.on({
					focus: function() {
						$(this).closest('.data-item').find('.tip').removeClass('error');
					},
					blur: function() {
						self.checkPwd($(this));
					}
				});

				self.$newPwd.on({
					focus: function() {
						self.hideTips($(this));
					},
					blur: function() {
						self.checkCopyPwd($(this));
					}
				});
				self.$submitBtn.click(function() {
					self.submitForm();
				});
				
			},

			checkIsValid: function() {
				var self = this;

				var params = {code: self.getIdFromUrl('code')};
				ajax.invoke({
					url: '/pwdInfo/verifyMailCode',
					type: 'GET',
					data: params,
					contentType: 'application/json',
					success: function (data) {
						if(data.success) {
							self.$userName.text(data.data)
							self.usr = data.data;
						} else {
							window.location.href = globalConfig.context.path + '/pwdInfo/info_error';
						}
					},
					failed: function(data) {
						window.location.href = globalConfig.context.path + '/pwdInfo/info_error';
					}
				 });
			},

			getIdFromUrl: function(name) {
	            var self = this;

	            var url = window.location.search;

	            if (url.indexOf('?') != -1) {
	                var str = url.substr(1),
	                    array = str.split('&');

	                for (var i = 0; i < array.length; i++) {
	                    var data = array[i].split('=');
	  					
	                    if (decodeURIComponent(data[0]) === name) {
	                        return data[1];
	                    }

	                } 
	            }
	            return;
	        },


			checkPwd: function($this) {
				var self = this;

				var oldPwdVal = $.trim($this.val());

				if(oldPwdVal.length <= 0 ) {
					self.canSubmit = false;
					return false;
				}

				if(!/(?!^[a-zA-Z]+$)(?!^\d+$)(^[a-zA-Z0-9]{6,18}$)/.test(oldPwdVal)) {
					self.canSubmit = false;
					self.showTips($this);
				} else {
					$this.closest('.data-item').find('.tip').removeClass('error');
					self.checkCopyPwd(self.$newPwd);
				}
			},

			checkCopyPwd: function($this) {
				var self = this;

				var oldPwdVal = $.trim(self.$oldPwd.val());
					newPwdVal = $.trim($this.val());

				if(oldPwdVal.length <= 0 || newPwdVal.length <= 0) {
					self.canSubmit = false;
					return false;
				}

				if(oldPwdVal !== newPwdVal) {
					self.showTips($this, '两次密码输入不一致');
					self.canSubmit = false;
				} else {
					self.hideTips($this);
					self.canSubmit = true;
				}
			},

			showTips: function($dom, text) {
				var self = this;

				$dom.closest('.data-item').find('.tip').removeClass('hide').addClass('error').find('.text').text(text);
			},

			hideTips: function($dom) {
				var self = this;

				$dom.closest('.data-item').find('.tip').removeClass('error').addClass('hide');
			},

			submitForm: function() {
				var self = this;

				if(!self.pwdInfoForm.verifyIsNull()) {
					new Dialog({
			            type:'error',
			            title:'提示',
			            content: '密码不能为空'
			        });
			        return;
				}

				if(!self.canSubmit) {
					return;
				}

				var params = {
					usr: self.usr,
					pwd: $.trim(self.$oldPwd.val())
				};

				ajax.invoke({
					url: '/pwdInfo/resetPwd',
					type: 'POST',
					data: JSON.stringify(params),
					contentType: 'application/json',
					success: function (data) {
						if(data.success) {
							new Dialog({
					            type:'ok',
					            title:'提示',
					            content: '重设成功',
					            onConfirm: function() {
					            	window.location.href = globalConfig.context.path + '/login';
					            }
					        });
						}
					},
					failed: function(data) {
						new Dialog({
					        type:'error',
					        title:'提示',
					        content: data.message || '重设失败'
					    });
					}
				});
			}
		};

	PwdInfo.init();
});