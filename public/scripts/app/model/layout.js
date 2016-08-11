define(['jquery'], function () {
	
	var Layout = function () {
		this.init();
	};

	Layout.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$group = $('#group');
			self.$legend = $('#legend-container');
			self.$parts = $('#parts');
			self.$groupToggleBar = $('#group-toggle-bar');
			self.$partsToggleBar = $('#parts-toggle-bar');
			self.$legendList = $('#legend-list-wrap');
			self.$legendPartsWrap = $('#legend-parts-wrap');
		},

		bindEvent: function () {
			var self = this;

			self.$groupToggleBar.click(function () {
				self.toggleGroup();
			});

			self.$partsToggleBar.click(function () {
				self.toggleParts();
			});
		},

		toggleGroup: function () {
			var self = this;

			if(self.$group.is(':visible')) {
				self.$group.addClass('hide');
				self.$legendPartsWrap.addClass('collapse-group');
				self.$groupToggleBar.addClass('collapse');
				self.$legend.addClass('collapse-group');
			} else {
				self.$group.removeClass('hide');
				self.$legendPartsWrap.removeClass('collapse-group');
				self.$groupToggleBar.removeClass('collapse');
				self.$legend.removeClass('collapse-group');
			}
		},

		toggleParts: function () {
			var self = this;

			if(self.$parts.is(':visible')) {
				self.$parts.addClass('hide');
				self.$partsToggleBar.addClass('collapse');
				self.$legend.addClass('collapse-parts');
			} else {
				self.$parts.removeClass('hide');
				self.$partsToggleBar.removeClass('collapse');
				self.$legend.removeClass('collapse-parts');
			}
		},

		showLegendList: function () {
			var self = this;

			self.$legendList.show();
			self.$legendPartsWrap.hide();
		},

		showLegendParts: function () {
			var self = this;

			self.$legendList.hide();
			self.$legendPartsWrap.show();
		}

	};

	return Layout;

});