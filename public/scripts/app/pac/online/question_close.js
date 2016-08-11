define(['ajax' ,'mustache', 'dialog',  'getFormValue','jquery','numLimit'], function(ajax, Mustache, Dialog) {
	var defaultOpts = {
		commentForm: '.question-comment-form',
		qualityTempl: '#service-quality-template',
		qualityWrapper: '#service-quality',
		questionCode: '#question-code',
		closeBtn: '[data-action="close-question"]',
		callbacks: {
			onConfirm: null
		}
	};

	var qustionCloseAction = function(options) {
		this.opts = $.extend(true, {}, defaultOpts, options);
		this.init();
	};

	qustionCloseAction.prototype = {
		init: function() {
			var self = this;

			self.initEls();
			self.initComponent();
			self.initEvents();

		},

		initEls: function() {
			var self = this;

			self.$commentForm = $(self.opts.commentForm);
			self.qualityTempl = $(self.opts.qualityTempl);
			self.$qualityWrapper = $(self.opts.qualityWrapper);
			self.$questionCode = $(self.opts.questionCode);
			self.closeBtn = $(self.opts.closeBtn);

			self.numLimitShort = $('.num-limit-short');
		},

		initComponent: function() {
			var self = this;

			self.getServiceQuality();
			self.numLimitShort.limit({num: 200});
		},

		initEvents: function() {
			var self = this;

			self.closeBtn.click(function() {
				self.postComments();
				return false;
			});
		},

		getServiceQuality: function() {
			var self = this;

			ajax.invoke({
				url: '/pac/online/getQualityList',
				type: 'GET',
				success: function (data) {
					self.renderServiceQuality(data);
				}
			});
		},

		renderServiceQuality: function(data) {
			var self = this;

			var template = self.qualityTempl.html(),
				html = Mustache.render(template, {qulityList: data});
			self.$qualityWrapper.html(html);
			self.$commentForm.find('.form-select-option').eq(0).trigger('click');
		},

		postComments: function() {
			var self = this;

			var params;
					
			if(self.closeBtn.hasClass('disabled')) {return;}
			if(!self.$commentForm.verifyIsNull()) {
				new Dialog({
	                type:'error',
	                title:'提示',
	                content: '请选择服务质量！'
	            });
				return;
			}
			var qd = {questionCode: self.$questionCode.val()};

			params = $.extend(self.$commentForm.getFormValue(), {questionCode: self.$questionCode.val()});

			ajax.invoke({
				url: '/pac/online/closeQuestion',
				type: 'POST',
				data: params,
				beforeSend: function() {
					self.closeBtn.addClass('disabled');
				},
				success: function (data) {
					if(data.success) {
						self.resetForm();
						if(typeof self.opts.callbacks.onConfirm === 'function') {
			            	self.opts.callbacks.onConfirm.apply(null, params);
			            }
					}
				},
				failed: function (data) {
					new Dialog({
			            type:'error',
			            title:'提示',
			            content: data.message || '提交失败，问题状态为已关闭状态。',
			            onConfirm: function() {
			            	window.location.reload();
			            }
			        });
			        
				},
				complete: function() {
					self.closeBtn.removeClass('disabled');
				}
		 	});
		},

		resetForm: function() {
			var self = this;

			self.$commentForm.get(0).reset();
		}
	};

	return qustionCloseAction;
})