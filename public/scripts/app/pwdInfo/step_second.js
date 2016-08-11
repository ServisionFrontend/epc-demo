require(['ajax', 'dialog', 'jquery'], function(ajax, Dialog) {
	var PwdInfo = {

			init: function() {
				var self = this;
				
				self.initDom();
				self.initAttrs();
				self.getInitialData();
				self.initEvent();
			},

			initDom: function() {
				var self = this;
				
				self.mailText = $('.mail-box').find('.mail-text');
				self.sendMailBtn = $('[data-action="send-mail"]');
			},

			initAttrs: function() {
				var self = this;

				self.resetUrl = globalConfig.context.path + '/pwdInfo/step_third?code=';
			},

			initEvent: function() {
				var self = this;

				self.sendMailBtn.click(function() {
					self.submitForm();
				});
				
			},

			getInitialData: function(repeat) {
				var self = this;

				var info  = self.getIdFromUrl('info');
				self.mailText.text(info);
				
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
	                        return decodeURIComponent(data[1]);
	                    }
	                } 
	            }
	            return;
	        },

	        submitForm: function() {
				var self = this;

				self.usr = self.getIdFromUrl('usr');
				var params = {
					usr: self.usr,
					resetUrl: self.resetUrl
				};

				ajax.invoke({
					url: '/pwdInfo/sendMail',
					type: 'POST',
					data: JSON.stringify(params),
					contentType: 'application/json',
					success: function (data) {
						if(data.success) {
							new Dialog({
					            type:'ok',
					            title:'提示',
					            content: '发送成功'
					        });
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