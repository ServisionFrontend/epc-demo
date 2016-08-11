define(['ajax', 'mustache', 'jquery', 'showLoading'], function (ajax, Mustache) {

	var VinAnalysis = function () {
		this.init();
	};

	VinAnalysis.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#vin-analysis-dialog');
			self.$query = $('#vin-analysis-query');
			self.$result = $('#vin-analysis-result');
			self.$btnSearch = self.$dialog.find('[data-id=search]');
			self.$btnClear = self.$dialog.find('[data-id=reset]');
			self.$vinInput = self.$query.find('[data-name=vin]');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$result.find('script').html();
		},

		bindEvent: function () {
			var self = this;

			self.$vinInput.keyup(function (e) {
				if(e.keyCode === 13) {
					self.load();
				}
			});

			self.$btnSearch.click(function () {
				self.load();
			});

			self.$btnClear.click(function () {
				self.hideTips();
				self.$result.hide();
				self.$query.find('input[data-name]').val('');
			});
		},

		validate: function (val) {
			var self = this;

			if(val.length != 17) {
				self.showTips('请输入17位的整车编码');
				self.$result.hide();
				return false;
			}

			self.hideTips();
			return true;
		},

		showTips: function (text) {
			var self = this,
				$tip = self.$dialog.find('.tips');

			$tip.parent().show();
			$tip.find('.text').text(text);
		},

		hideTips: function () {
			var self = this,
				$tip = self.$dialog.find('.tips');

			$tip.parent().hide();
		},

		load: function () {
			var self = this,
				val = $.trim(self.$vinInput.val());

			if(!self.validate(val)) return;

			self.$dialog.showLoading();
			ajax.invoke({
				url: '/epc/vin?vin=' + val,
				beforeSend: function () {
					self.hideTips();
					self.$result.hide();
				},
				complete: function () {
					self.$dialog.hideLoading();
				},
				success: function (root) {
					if(root.success) {
						root.data ? self.render(root.data) : self.noRender(root);
					} else {
						self.showTips(root.message || '出错了，请重试或联系客服');
					}
				}
			});
		},

		render: function (data) {
			var self = this,
				output = Mustache.render(self.template, {record: data});

			self.$result.html(output).show();
		},

		noRender: function () {
			var self = this;

			self.showTips('未查询到相关信息');
		},
		
		fillSearch: function (obj) {
			var self = this,
				$el;

			if(!obj) return false;

			$el = self.$query.find('[data-name=' + obj.key + ']');
			if($el.length > 0) $el.val(obj.val);
		},

		open: function (obj) {
			var self = this;

			self.fillSearch(obj);

			$.showBlockUI({
				message: self.$dialog,
				name: 'vin-analysis'
			});
			self.load();
		}

	};

	return VinAnalysis;

});