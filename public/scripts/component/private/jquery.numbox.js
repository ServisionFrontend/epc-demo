/*!
 * jQuery numbox
 * Version 1.0-2015.6.26
 * @requires jQuery v1.4 or later
 */

(function($) {

	function setup() {

		var numbox = {

			init: function (target) {
				var self = this;

				self.$parent = $(target);
				self.opts = $.data(target, 'numbox').options;
				self.initEvents();
				self.controlAllBtnsStatus();
			},

			initEvents: function() {
				var self = this,
					action;

				self.$parent.on('click', '[data-action]', function (e) {
					action = $(e.target).attr('data-action');
					if($(this).hasClass('disabled')) return;

					if(action == 'reduce') {self.reduce($(e.target));}
					if(action == 'increase') {self.increase($(e.target));}
				}).on('blur', '.qty-input', function (e) {
					self.blurInput($(this));
				});
			},

			setVal: function (params) {
				var self = this;

				params.target.val(params.val);
				self.controlBtnStatus(params.target);
			},

			getVal: function($target) {
				var self = this;

				return parseInt($target.closest('[data-itemId=qty-box]').find('.qty-input').val());
			},

			blurInput: function ($target) {
				var self = this,
					pattern = /^[1-9][\d]*$/,
					params = self.getParams($target);
					val = params.val,
					minVal = params.minVal,
					maxVal = params.maxVal;

				if (!String(val).match(pattern)) {
					$target.val(minVal);
				} 
				self.change($target);
				self.controlBtnStatus($target);
			},

			reduce: function($target) {
				var self = this,
					params = self.getParams($target),
					val = params.val - params.step;

				if (params.minVal <= val) {
					params.$input.val(val);
					self.change($target);
				}
				self.controlBtnStatus($target);
			},

			increase: function($target) {
				var self = this,
					params = self.getParams($target),
					val = params.val + params.step;

				//if (val <= params.maxVal) {
					params.$input.val(val);
					self.change($target);
				//}
				self.controlBtnStatus($target);
			},

			controlAllBtnsStatus: function () {
				var self = this,
					$boxs = self.$parent.find('[data-action=reduce]');

				for(var i = 0; i < $boxs.length; i++) {
					self.controlBtnStatus($boxs.eq(i));
				}
			},

			controlBtnStatus: function($target) {
				var self = this,
					params = self.getParams($target);

				if (params.val > params.minVal) {
					params.$btnReduce.removeClass('disabled');
				} else {
					params.$btnReduce.addClass('disabled');
				}
				if(params.maxVal) {
					if (params.val < params.maxVal) {
						params.$btnIncrease.removeClass('disabled');
					} else {
						params.$btnIncrease.addClass('disabled');
					}
				}
			},

			getParams: function ($target) {
				var self = this,
					$box = $target.closest('[data-itemId=qty-box]');

				return {
					val : parseInt($box.find('.qty-input').val()),
					minVal : parseInt($box.attr('data-min') || 1),
					maxVal : parseInt($box.attr('data-max')),
					step : parseInt($box.attr('data-step') || 1),
					$btnReduce : $box.find('[data-action=reduce]'),
					$btnIncrease : $box.find('[data-action=increase]'),
					$input: $box.find('.qty-input')
				}
			},

			change: function($target) {
				var self = this,
					val = self.getVal($target);

				if (typeof self.opts.onchange === 'function') {
					self.opts.onchange.apply(self, [val, $target]);
				}
			},

			reset: function($target) {
				var self = this;

				$target.find('.qty-box').val('');
			},

			disabled: function ($target) {
				var self = this,
					params = self.getParams($target);
				
				params.$input.attr('disabled', 'true').addClass('disabled');
				params.$btnReduce.removeClass('disabled').addClass('disabled');
				params.$btnIncrease.removeClass('disabled').addClass('disabled');
			},
			
			enabled: function ($target) {
				var self = this,
					params = self.getParams($target);
				
				params.$input.removeAttr('disabled').removeClass('disabled');
				params.$btnReduce.removeClass('disabled');
				params.$btnIncrease.removeClass('disabled');
			}
		};

		$.fn.numbox = function(options, params) {
			var self = this;

			if (typeof options === "string") {
				return $.fn.numbox.methods[options](self, params);
			}

			return self.each(function() {

				$.data(this, 'numbox', {
					options: $.extend({}, $.fn.numbox.defaults, options || {})
				});

				this.numbox = $.extend({}, numbox, {});
				this.numbox.init(this);
			});
		};

		$.fn.numbox.methods = {
			setVal: function (jq, params) {
				jq.each(function(){
					this.numbox.setVal(params);
				});
			},
			getVal: function(jq) {
				return jq.get(0).numbox.getVal();
			},
			setMinVal: function(jq, val) {
				jq.each(function(){
					this.numbox.setMinVal(val);
				});
			},
			reset: function(jq) {
				jq.each(function() {
					this.numbox.reset();
				});
			},
			disabled: function (jq) {
				jq.each(function() {
					this.numbox.disabled();
				});
			},
			enabled: function (jq) {
				jq.each(function() {
					this.numbox.enabled();
				});
			},
			controlAllBtnsStatus: function (jq) {
				jq.each(function () {
					this.numbox.controlAllBtnsStatus();
				})
			}
		};

		$.fn.numbox.defaults = {
			step: 1,
			minVal: 1,
			maxVal: 100,
			onchange: null
		};
	}

	/* Using require js AMD standard */
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {

		define([], setup);

	}
})(jQuery)