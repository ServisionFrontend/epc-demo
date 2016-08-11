define(['jquery', 'jqExtend'], function () {

	var defaultOpts = {
		checkFirstNode: false,
		callbacks: {
			onClickedLeaf: null,
			onClickedGroup: null
		}
	};

	var Group = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	Group.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
			if(self.opts.checkFirstNode) self.checkFirstNode();
		},                                      

		bindEls: function () {
			var self = this;

			self.$group = $('#group-body');
		},

		bindEvent: function () {
			var self = this,
				field;

			self.$group.on('click', 'a', function (e) {
				if($(this).hasClass('leaf')) {
					self.checkedNode($(this));
					self.clickedLeaf($(this).attr('data-code'));
				} else {
					field = $(e.target).attr('data-field');
					if(field === 'icon'){
						self.toggleGroup($(this))
					} else {
						self.checkedNode($(this));
						self.clickedGroup($(this));
					}	
				}
			});
		},

		clickedFirstGroup: function () {
			var self = this;

			self.$group.find('a[data-code]:first > [data-field=text]').trigger('click');
		},

		toggleGroup: function ($target) {
			var self = this;

			if($target.hasClass('expand')) {
				$target.removeClass('expand');
				$target.next().hide();
			} else {
				$target.addClass('expand');
				$target.next().show();
			}
		},

		checkedNode: function ($target) {
			var self = this;

			self.$group.find('.checked').removeClass('checked');
			$target.addClass('checked');
		},

		clickedLeaf: function (code) {
			var self = this,
				$target = self.$group.find('a[data-code=' + code + ']'),
				$list = $target.parents('ul');

			self.checkedNode($target);
			$list.show();
			$list.each(function (i, e) {
				$(e).prev('a').removeClass('expand').addClass('expand');
			});

			if(typeof self.opts.callbacks.onClickedLeaf === 'function') {
				self.opts.callbacks.onClickedLeaf.apply(self, [$target, code]);
			}
		},

		clickedGroup: function ($target) {
			var self = this;

			if(typeof self.opts.callbacks.onClickedGroup === 'function') {
				self.opts.callbacks.onClickedGroup.apply(self, [$target, $target.attr('data-code')]);
			}
		},

		getImagesEls: function ($target) {
			var self = this,
				$els = $target.parent().find('.leaf'),
				data = [], $el;

			for(var i = 0; i < $els.length; i++) {
				$el = $els.eq(i);
				data.push({
					code: $el.attr('data-code') || '',
					name: $el.attr('data-name') || '',
					svgFile: $el.attr('data-svgFile') || '',
					gifFile: $el.attr('data-gifFile') || ''
				});
			}
			return data;
		},

		getCheckedEl: function () {
			var self = this;

			return self.$group.find('a[class*=checked]').eq(0);
		}

	};

	return Group;
});