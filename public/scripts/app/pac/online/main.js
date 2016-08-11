require(['ajax', 'mustache', 'dialog', 'uploadFile', 'header', 'jquery', 'select', 'carCatalogSelect', 'getFormValue', 'jqForm', 'json2', 'numLimit'],
	function(ajax, Mustache, Dialog, UploadFile, Header) {
		var online = {
			init: function() {
				var self = this;

				self.bindEls();
				self.buildAttrs();
				self.getQuestionsClassify();
				self.getServiceInfo();
				self.buildComponent();
				self.bindEvent();
			},

			bindEls: function() {
				var self = this;

				self.$tab = $('#tab');
				self.$tabCont = $('#tab-cont');
				self.$changedom = $('.change-item');
				self.$questionSelect = $('#question-select');
				self.$submitBtn = $('a[data-action="submit"]');
				self.$resetBtn = $('a[data-action="reset"]');
				self.$serviceCode = $('input[data-name="service-code"]');
				self.$serviceName = $('input[data-name="service-name"]');
				self.$phoneInput = $('input[name="contactPhone"]');
				self.$vin = $('input[name="vin"]');
				self.$questionForm = $('#question-form');
				self.$questionDescription = $('textarea[name="description"]');

			},

			buildAttrs: function() {
				var self = this;

				self.can = true;
				self.urlArray = ['/pac/online', '/pac/online/question_search', '/pac/online/myquestion'];
			},

			buildComponent: function() {
				var self = this;

				self.header = new Header();
				self.$tabCont.carCatalogSelect();
				self.uploadFile = new UploadFile();
				self.$questionDescription.limit();
			},

			bindEvent: function() {
				var self = this;

				self.$tab.on('click', '[data-field]', function() {
					self.toggleTab($(this));
				});
				self.$questionSelect.on('evtChange', function() {
					self.selectQuestion($(this));
				});
				self.$submitBtn.click(function() {
					self.submitForm($(this));
				});
				self.$resetBtn.click(function() {
					self.resetForm();
				})
				self.$phoneInput.on({
					'blur': function() {
						self.verifyPhone($(this));
					},
					'input': function(e) {
						if (e.which === 13) {
							self.trigger('blur');
						}
					},
					'propertychange': function(e) {
						if (e.which === 13) {
							self.trigger('blur');
						}
					}
				});
				self.$vin.on({
					'blur': function() {
						self.verifyVin($(this));
					},
					'input': function(e) {
						if (e.which === 13) {
							self.trigger('blur');
						}
					},
					'propertychange': function(e) {
						if (e.which === 13) {
							self.trigger('blur');
						}
					}
				});


			},

			toggleTab: function($this) {
				var self = this;

				var index = $this.attr('data-field');
				if ($this.hasClass('checked')) {
					return;
				}
				window.location.href = globalConfig.context.path + self.urlArray[index];
			},

			getQuestionsClassify: function() {
				var self = this;

				ajax.invoke({
					url: '/pac/online/questionType',
					type: 'GET',
					success: function(data) {
						self.renderTemplate(data);
					}
				});
			},

			renderTemplate: function(data) {
				var self = this;

				var template = $('#deep-group-template').html(),
					html;

				html = Mustache.render(template, {
					data: data
				});

				$('#deep-group').html(html);
				self.$questionSelect.find('.form-select-option').eq(0).trigger('click');
			},

			selectQuestion: function($this) {
				var self = this;

				var value = $this.attr('data-value'),
					type = $this.find('.form-select-option.currentOption').attr('data-type');
				self.questionType = type;

				if (type === '1') {
					self.$changedom.show().find('input,textarea').removeClass('hide');
				} else if (type === '2') {
					self.$changedom.hide().find('input,textarea').addClass('hide');
				}
			},

			getServiceInfo: function() {
				var self = this;

				ajax.invoke({
					url: '/pac/online/serviceInfo',
					type: 'GET',
					success: function(data) {
						self.$serviceCode.val(data.CODE);
						self.$serviceName.val(data.NAME);
					}
				});
			},

			verifyPhone: function($this) {
				var self = this;

				var val = $.trim($this.val());

				if (val.length > 0) {
					if (!telReg.test(val)) {
						new Dialog({
							type: 'error',
							title: '提示',
							content: '电话号码格式不正确'
						});
						return false;
					}
					return true;
				}
				return false;
			},

			verifyVin: function($this) {
				var self = this;

				var val = $.trim($this.val());

				if (val.length === 0) {
					return true;
				}
				if (val.length === 17) {
					return true;
				} else {
					new Dialog({
						type: 'error',
						title: '提示',
						content: 'vin码需满足17位'
					});
					return false;
				}
			},

			submitForm: function($this) {
				var self = this;
				var params;

				if ($this.hasClass('disabled')) {
					return;
				}
				if (!self.$tabCont.verifyIsNull()) {
					new Dialog({
						type: 'error',
						title: '提示',
						content: '必填项不能为空' || '提交失败'
					});
					return;
				}

				if (self.questionType == 1 && !self.verifyVin(self.$vin)) {
					return;
				}

				if (!self.verifyPhone(self.$phoneInput)) {
					return;
				}
				$this.addClass('disabled');

				self.$questionForm.ajaxSubmit({
					resetForm: true,
					iframe: true,
					type: 'post',
					url: '/pac/online/uploadQuestionFile',
					beforeSerialize: function($form, options) {
						var description = htmlEncode(self.$questionDescription.val());
						$form.find('[name="description"]').val(description);
						return true;
					},
					success: function(data) {
						var data = JSON.parse(data);
						if (data.success) {
							new Dialog({
								type: 'ok',
								title: '提示',
								content: data.message || '提交成功',
								onConfirm: function() {
									window.location.href = "/pac/online/myquestion";
								}
							});
						} else {
							new Dialog({
								type: 'error',
								title: '提示',
								content: data.message || '提交失败',
								onConfirm: function() {
									self.resetForm();
								}
							});
						}
					},
					error: function(data) {
						var data = JSON.parse(data);
						new Dialog({
							type: 'error',
							title: '提示',
							content: data.message || '提交失败'
						});
					},
					complete: function() {
						$this.removeClass('disabled');
					}
				});

			},

			resetForm: function() {
				var self = this;

				var $fileName = $('.file-name');

				self.$questionForm.get(0).reset();
				$fileName.text('');
				self.$textExist.text(0);
				self.$textRemain.text(self.limitNum);
				self.resetSelect();
				self.getServiceInfo();
			},

			resetSelect: function() {
				var self = this;

				var array = $('[data-input="select"]:not(#question-select)');

				array.each(function(index, ele) {
					var $ele = $(ele),
						sign = $ele.attr('data-sign');

					$ele.find('.form-select-input').val('');
					$ele.find('.form-select-text').text('请选择');
					if (sign == 'series' || sign == 'child-group' || sign == 'main-group') {
						$ele.addClass('disabled');
					}
				});
			}
		}
		online.init();
	});