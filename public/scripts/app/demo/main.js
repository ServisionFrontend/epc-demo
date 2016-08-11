require(['zeroClipboard', 'jquery'], function (ZeroClipboard) {

	var demo = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
			self.initTab();

			var clip = new ZeroClipboard(document.getElementById("copy"));
		},

		bindEls: function () {
			var self = this;

			self.$tab = $('#tab');
			self.$tabCont = $('#tab-cont');
		},

		bindEvent: function () {
			var self = this;

			self.$tab.on('click', '[data-field]', function () {
				self.toggleTab($(this));
			});
		},

		initTab: function () {
			var self = this;

			self.toggleTab(self.$tab.find("[data-field]:eq(0)"));
		},

		toggleTab: function ($target) {
			var self = this,
				field = $target.attr('data-field');

			self.$tab.find('.checked').removeClass('checked');
			$target.addClass('checked');
			self.$tabCont.find('[data-field=' +field+ ']').show().siblings().hide();
		}

	};

	demo.init();

})