require(['ajax', 'mustache', 'dialog', 'uploadFile', 'qustionCloseAction', 'moment', 'jquery', 'select', 'getFormValue', 'jqForm', 'json2', 'numLimit'],
	function(ajax, Mustache, Dialog, UploadFile, CloseAction, moment) {
		var detail = {
			init: function() {
				var self = this;

				self.initEls();
				self.initAttrs();
				self.initComponent();
				self.initEvents();
			},

			initEls: function() {
				var self = this;

				self.questionCode = $('#question-code');
				self.serviceQuality = $('#service-quality-wrap');
				self.$replyForm = $('#reply-form');
				self.$commentForm = $('.question-comment-form');
				self.$replyHistoryTempl = $('#reply-history-template');
				self.$replyContent = self.$replyForm.find('[name="content"]');
				self.historyWrapper = $('#reply-history-wrapper');
				self.replyBtn = $('[data-action="reply"]');

				self.limitNumLong = $('.num-limit');
			},

			initAttrs: function() {
				var self = this;

				self.code = self.questionCode.val();
			},

			initComponent: function() {
				var self = this;

				if (self.serviceQuality.length > 0) {
					self.qustionCloseAction = new CloseAction({
						callbacks: {
							onConfirm: function() {
								window.location.reload();
							}
						}
					});
				}
				self.getReplyHistory();
				self.uploadFile = new UploadFile();
				self.limitNumLong.limit();
			},

			initEvents: function() {
				var self = this;

				self.replyBtn.on('click', function() {
					self.postForm($(this));
				});
			},

			getReplyHistory: function() {
				var self = this;

				var params = {
					questionCode: self.code
				};

				ajax.invoke({
					url: '/pac/online/replyHistory',
					type: 'GET',
					dataType: 'json',
					data: params,
					success: function(data) {
						self.formatListDate(data)
						self.renderReplyHistory(data);
					}
				});
			},

			renderReplyHistory: function(data) {
				var self = this;

				var template = self.$replyHistoryTempl.html(),
					html;

				for (var i in data) {
					if (data[i].attachments.length > 0) {
						data[i].hasAttachment = true;
						data[i].columnClass = 'fix';
					} else {
						data[i].hasAttachment = false;
						data[i].columnClass = 'single';
					}
					data[i].content = htmlDecode(data[i].content);
				}

				html = Mustache.render(template, {
					reply: data
				});
				self.historyWrapper.html(html);
			},

			postForm: function($this) {
				var self = this;

				if ($this.hasClass('disabled')) {
					return;
				}

				if (!self.$replyForm.verifyIsNull()) {
					new Dialog({
						type: 'error',
						title: '提示',
						content: '请填写问题答复！'
					});
					return;
				}

				$this.addClass('disabled');

				self.$replyForm.ajaxSubmit({
					resetForm: true,
					iframe: true,
					type: 'post',
					url: '/pac/online/uploadReplyForm',
					data: {
						questionCode: self.code
					},
					beforeSerialize: function($form, options) {
						var content = htmlEncode(self.$replyContent.val());
						$form.find('[name="content"]').val(content);
						return true;
					},
					success: function(data) {
						var data = JSON.parse(data);
						if (data.success) {
							window.location.reload();
						} else {
							new Dialog({
								type: 'error',
								title: '提示',
								content: data.message || '回复失败',
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
							content: data.message || '回复失败'
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

				$fileName.text('');
				self.$textExist.text(0);
				self.$textRemain.text(self.limitNum);
			},

			formatListDate: function(result) {
				var self = this;

				for (var i = 0; i < result.length; i++) {

					result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		}
		detail.init();
	})