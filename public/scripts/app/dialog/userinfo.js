define(['ajax', 'mustache','moment', 'dialog', 'blockUI', 'jqExtend', 'jquery', 'showLoading'], function (ajax, Mustache, moment, Dialog) {

	var Userinfo = function () {
		this.init();
	};

	Userinfo.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
			self.bindAttr();
			self.load();
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#user-info-dialog');
			self.$contBody = $('#user-info-body');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$contBody.find('script').html();
		},

		bindEvent: function () {
			var self = this,
				id;

			self.$contBody.on('click', '[data-id]', function () {
				id = $(this).attr('data-id');
				switch (id) {
					case 'edit':
						self.editPhone();
						break;
					case 'save':
						self.savePhone();
						break;
					case 'cancel':
						self.cancelPhone();
						break;
					default:
						break;
				}
			});
		},

		load: function () {
			var self = this;

			ajax.invoke({
				url: '/epc/user',
				cache: false,
				type: 'GET',
				success: function (root) {
					self.render(self.buildData(root));
				}
			});
		},

		buildData: function (data) {
			var self = this;

			if(data.expirationTime) {
				data.expirationTime = moment(data.expirationTime).format('YYYY-MM-DD');
			}

			return data;
		},

		render: function (data) {
			var self = this,
				output = Mustache.render(self.template, {record: data});

			self.$contBody.html(output);
		},

		open: function () {
			var self = this;

			$.showBlockUI({
				message: self.$dialog,
				name: 'user-info'
			});
		},

		editPhone: function () {
			var self = this;

			self.$dialog.find('[data-field=phone-info]').addClass('hide');
			self.$dialog.find('[data-field=phone-edit]').removeClass('hide');
		},

		savePhone: function () {
			var self = this;

			if(!self.validatePhone()) return;

			self.$dialog.showLoading();
			ajax.invoke({
				url: '/epc/user',
				type: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify({
					telephone: self.$dialog.find('[data-field=phone-edit]').find('input').val(),
					username: pageConfig.username
				}),
				success: function (root) {
					self.load();
				},
				complete: function () {
					self.$dialog.hideLoading();
				}
			});
		},

		cancelPhone: function () {
			var self = this;

			self.$dialog.find('[data-field=phone-info]').removeClass('hide');
			self.$dialog.find('[data-field=phone-edit]').addClass('hide');
		},

		validatePhone: function () {
			var self = this,
				val = $.trim(self.$dialog.find('[data-field=phone-edit]').find('input').val());

			if(val.length == 0) {
				new Dialog({
					type: 'error',
					content: '请输入联系电话'
				});
				return false;
			} else if(!telReg.test(val)) {
				var message = '<div class="layer user-info-tip-layer" style="display:block;" id="user-info-tip-layer"><div class="layer-title"><span class="page-title"><span class="text">错误</span></span><a href="javascript:;" class="layer-close-btn"></a></div><div class="layer-cont-wrapper">请输入正确的格式：</br>1.输入数字要求为半角数字</br>2.手机号码(1 + 10位数字）</br>示例：18912345678</br>3.座机号码(区号-7/8电话号码-1/4分机号) </br>  示例： "021-12345678"、"0571-12345678-241"</div></div>';
				$.showBlockUI({
					message: message,
					css: {
						left: 0,
						top: 0,
						width: self.$dialog.width(),
						height: self.$dialog.height()
					},
					name: 'userinfo-tip',
					parent: self.$dialog,
					onBlock: function () {
						$('#user-info-tip-layer').find('.layer-close-btn').on('click', function () {
							$.hideBlockUI({
								message: message,
								parent: self.$dialog, 
								name: "userinfo-tip",
								fadeOut: 0,
								onUnblock: function () {
									$('#user-info-tip-layer').find('.layer-close-btn').off('click');
								}
							});
						});
					}
				});
				return false;
			}

			return true;
		}

	};

	return Userinfo;

});