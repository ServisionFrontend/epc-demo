define(['ajax', 'dialog', 'jquery'], function(ajax, Dialog) {
	var options = {
		uploadForm: '#upload-form',
		fileInput: '.file-input',
		fileNameText: '.file-name',
		addColumn: '.add-column'
	};

	var uploadForm = function(opts) {
		this.opts = $.extend(true, {}, options, opts || {});
		this.init();
	};

	uploadForm.prototype = {
		init: function() {
			var self = this;

			self.initEls();
			self.initAttrs();
			self.initEvents();
		},

		initEls: function() {
			var self = this;

			self.uploadForm = $(self.opts.uploadForm);
			self.fileInput = self.uploadForm.find(self.opts.fileInput);
			self.fileNameText = self.uploadForm.find(self.opts.fileNameText);
			self.addColumnBtn = self.uploadForm.find(self.opts.addColumn);
		},

		initAttrs: function() {
			var self = this;

			self.columnNmuber = 2;
		},

		initEvents: function() {
			var self = this;

			$(document).on('change', self.opts.fileInput, function() {
				self.setFileName($(this));
			});
			self.addColumnBtn.click(function() {
				self.addColumn();
			})
		},

		setFileName: function($this) {
			var self = this;

			var val = $this.val().split('\\');
			$this.parent().siblings(self.opts.fileNameText).text(val[val.length-1]);
		},

		addColumn: function() {
			var self = this;

			var template='<div class="data-item fix middle-text"><span class="label"><span class="text" title=""></span></span><span class="file-name"></span><a href="javascript:;" class="btn upload-btn"><span>浏览</span><input class="input-box file-input" type="file" name="file'+self.columnNmuber+ '"></a></div>';
			if(self.columnNmuber > 5) {
				new Dialog({
		             type:'error',
		             title:'提示',
		             content: '最多添加5个附件' || '提交失败'
		        });
				return;
			}
			self.uploadForm.append(template);
			self.columnNmuber++;
		}
	}
	return uploadForm;
})