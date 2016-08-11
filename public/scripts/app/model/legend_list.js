define(['mustache', 'jquery'], function (Mustache) {

	var defaultOpts = {
		callbacks: {
			onClickedImage: null
		}
	};

	var LegendList = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	LegendList.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$legendList = $('#legend-list-wrap');
			self.$legendListCont = $('#legend-list-cont');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$legendListCont.find('script').html();
		},

		bindEvent: function () {
			var self = this;

			self.$legendListCont.on('click', 'a', function () {
				self.gotoUsage($(this));
			});
		},

		render: function (data) {
			var self = this,
				output = Mustache.render(self.template, {records: data});

			self.$legendListCont.html(output);
		},

		gotoUsage: function ($target) {
			var self = this;

			if(typeof self.opts.callbacks.onClickedImage === 'function') {
				self.opts.callbacks.onClickedImage.apply(self, [$target, $target.attr('data-code')]);
			}
		}

	};

	return LegendList;

});