(function(fn) {
	if(typeof module ==='object' && typeof module.exports === 'object') {
		module.exports = fn();
	} else if(typeof require === 'function') {
		require(['jquery'], fn)
	} else {
		fn();
	}
}(function() {
	var limit = {
		init: function(target) {
			var self = this;

			self.$target = $(target);
			self.opts = $.data(target, 'limit').options;

			self.initEls();
			self.initAttrs();
			self.initEvents();
		},

		initEls: function() {
			var self = this;

			self.$warpper = self.$target.closest(self.opts.wrapperItemCls);
			self.$textExist = self.$warpper.find(self.opts.textExistCls);
			self.$textRemain = self.$warpper.find(self.opts.textRemainCls);
		},

		initAttrs: function() {
			var self = this;

			self.limitNum = self.opts.num || 500;
		},

		initEvents: function() {
			var self = this;

			self.$target.on({
				'input': function(e) {
					self.limitTextNum($(this));
				},
				'propertychange': function(e) {
					self.limitTextNum($(this));
				}
			})

		},

		limitTextNum: function($this) {
			var self = this,
				num = self.limitNum,
				value = $this.val(),
				length = value.length;

				if(length > num) {
					$this.val(value.substr(0, num));
					
				} else {
					self.$textExist.text(length);
					self.$textRemain.text(num - length);
				}
		}
	};

	$.fn.limit = function(params) {
		var jqEls = this;

		return jqEls.each(function() {
			$.data(this, 'limit', {
				options: $.extend(true, {}, $.fn.limit.defaults, params || {})
			});

			this.limit = $.extend({}, limit, {});
			this.limit.init(this);
		});
	};

	$.fn.limit.defaults = {
		wrapperItemCls: '.data-item',
		textExistCls: '.text-exist',
		textRemainCls: '.text-remain',
		num: 500
	}
}))
