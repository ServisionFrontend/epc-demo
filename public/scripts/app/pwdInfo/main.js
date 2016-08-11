require(['ajax', 'dialog', 'jqExtend', 'jquery', 'domReady!'], function(ajax, Dialog) {
	var defaults = {
			body: "body_pwdinfo"
		},
		PwdInfo = {

			init: function() {
				var self = this;
				self.buildDom();
				self.buildAttrs();
				self.bindEvent();
			},

			buildDom: function() {
				var self = this;
				self.$body = $("#" + defaults.body);
				self.$username = $('[name="username"]');
				self.$submitBtn = $('[data-action="submit"]');
			},

			buildAttrs: function() {
				var self = this;

				self.resetUrl = globalConfig.context.path + '/pwdInfo/step_third?code=';
			},

			bindEvent: function() {
				var self = this;
				self.$body.find("[placeholder]").initPlaceholder();

				self.$submitBtn.click(function() {
					self.submitForm();
				});
				self.$username.on('keydown', function(e) {
					if(e.which === 13) {
						self.submitForm();
					}
				});
			},
 
			submitForm: function() {
				var self = this;

				var val = $.trim(self.$username.val()), params;

				if(val.length <= 0) {
					new Dialog({
			            type:'error',
			            title:'提示',
			            content: '必填项不能为空'
			        });
			        return;
				}

				params = {
					usr: val,
					resetUrl: self.resetUrl
				};

				ajax.invoke({
					url: '/pwdInfo/sendMail',
					type: 'POST',
					data: JSON.stringify(params),
					contentType: 'application/json',
					success: function (data) {
						if(data.success) {
							window.location.href = globalConfig.context.path + '/pwdInfo/step_second?usr='+ val + '&info=' + encodeURIComponent(data.data);
						}
					},
					failed: function(data) {
						if(!data.success) {
							new Dialog({
					            type:'error',
					            title:'提示',
					            content: data.message || '发送失败'
					        });
						}
					}
				 });

			}
		};

	PwdInfo.init();
});