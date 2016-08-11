define(['jquery'], function () {

	var defaultOpts = {
		focusImg: 'focus-img',
		imgListContainer: 'img-list-container',
		imgList: 'img-list',
		arrowLeft: 'arrow-left',
		arrowRight: 'arrow-right',
		margin: 10,
		width: 80,
		initCheckFirstImg: true,
		callbacks: {
			onClickedImg: null
		}
	};

	var ThumbsImg = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();		
	};

	ThumbsImg.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
			self.initList();
			self.initToggleBtn();
			if(self.opts.initCheckFirstImg) self.initCheckedFirst();
		},

		bindEls: function () {
			var self = this;

			self.$focusImg = $('#' + self.opts.focusImg);
			self.$imgListContainer = $('#' + self.opts.imgListContainer);
			self.$imgList = $('#' + self.opts.imgList);
			self.$arrowLeft = $('#' + self.opts.arrowLeft);
			self.$arrowRight = $('#' + self.opts.arrowRight);
		},

		bindEvent: function () {
			var self = this;

			self.$arrowLeft.click(function () {
				self.toggleLeft();
			});

			self.$arrowRight.click(function () {
				self.toggleRight();
			});

			self.$imgList.on('click', 'img', function () {
				self.clickedImg($(this));
				if(typeof self.opts.callbacks.onClickedImg === 'function') {
					self.opts.callbacks.onClickedImg.apply(null, [$(this).attr('src')]);
				}
			})
		},

		initList: function () {
			var self = this,
				elLength = self.$imgList.children().length;

			self.$imgList.css({
				width: elLength * (self.opts.width + self.opts.margin)
			});
		},

		initCheckedFirst: function () {
			var self = this;

			if(self.$imgList.find('img').length > 0) {
				self.$imgList.find('img:first').trigger('click');
			}
		},

		initToggleBtn: function () {
			var self = this,
				num = self.$imgList.width() - self.$imgListContainer.width();

			if(num > 0) {
				self.$arrowRight.show();
			}
		},

		clickedImg: function ($target) {
			var self = this,
				src = $target.attr('src');

			self.$focusImg.attr('src', src);
			self.$imgList.children().removeClass('checked');
			$target.parent().addClass('checked');
		},

		replaceFocusImg: function (src) {
			var self = this;

			self.$focusImg.attr('src', src);
		},

		toggleLeft: function () {
			var self = this,
				left = self.$imgList.position().left || 0;

			self.$imgList.css('left', left + self.opts.width + self.opts.margin + 'px');
			self.toggleBtnStatus();
		},

		toggleRight: function () {
			var self = this,
				left = self.$imgList.position().left || 0;

			self.$imgList.css('left', left - self.opts.width - self.opts.margin + 'px');
			self.toggleBtnStatus();
		},

		toggleBtnStatus: function () {
			var self = this,
				left = self.$imgList.position().left || 0;
			
			if(left == 0) {
				self.$arrowLeft.hide();
			}
			if(left < 0) {
				self.$arrowLeft.show();
				self.$arrowRight.show();
			}
			if(left == -(self.$imgList.width() - self.$imgListContainer.width())) {
				self.$arrowRight.hide();
			}
		}

	};

	return ThumbsImg;

});