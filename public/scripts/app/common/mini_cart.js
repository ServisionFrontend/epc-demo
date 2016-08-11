define(['ajax', 'mustache', 'jquery', 'showLoading', 'jqExtend'], function (ajax, Mustache) {

	var defaultOpts = {
		callbacks: {
			onSetCartCount: null
		}
	};

	var MiniCart = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	MiniCart.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();
			if(self.template) {
				self.bindEvent();
				self.load();
			}
		},

		bindEls: function () {
			var self = this;

			self.$cart = $('#header-cart');
			self.$cartList = $('#header-cart-list');
			self.$count = self.$cart.find('[data-itemId=count]');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$cartList.find('script').html();
			self.timer = null;
		},

		bindEvent: function () {
			var self = this,
				action;

			self.$cartList.on('click', '[data-action]', function (e) {
				action = $(this).attr('data-action');
				switch (action) {
					case 'delete':
						self.clickedDelete($(this));
						break;
					case 'confirm':
						self.clickedConfirm($(this));
						break;
					case 'cancel':
						self.clickedCancel($(this));
						break;
					default:
						break;
				}
			});
		},

		clickedDelete: function ($target) {
			var self = this,
				$parent = $target.parent();

			$target.addClass('hide');
			$parent.find('.btn').removeClass('hide');
		},

		clickedConfirm: function ($target) {
			var self = this,
				id = $target.closest('li').attr('data-id');

			self.deleteGoods([id]);
		},

		clickedCancel: function ($target) {
			var self = this,
				$parent = $target.parent();

			$parent.find('.hide').removeClass('hide');
			$parent.find('.btn').addClass('hide');
		},

		load: function () {
			var self = this;

			ajax.invoke({
				type: 'GET',
				url: '/epc/cart/operation',
				cache: false,
				success: function (root) {
					self.loadSuccess(root);
				}
			});
		},

		loadSuccess: function (data) {
			var self = this,
				output = Mustache.render(self.template, {list: data});

			self.$cartList.html(output);
			self.$count.text(data.length);
			self.resetCartCount(data.length);
		},

		resetCartCount: function (count) {
			var self = this;

			if(typeof self.opts.callbacks.onSetCartCount === 'function') {
				self.opts.callbacks.onSetCartCount.apply(null, [count]);
			}
		},

		deleteGoods: function (ids) {
			var self = this;

			ajax.invoke({
				type: 'DELETE',
				url: '/epc/cart/operation',
				data: JSON.stringify({'ids':ids}),
				contentType: 'application/json',
				success: function (root) {
					if(root.success) {
						self.showTips('ok', '删除成功');
						self.load();
					} else {
						self.showTips('error', root.message);
					}
				}
			});
		},

		addGoods: function (params) {
			var self = this;

			ajax.invoke({
				type: 'PUT',
				url: '/epc/cart/operation',
				data: JSON.stringify(params),
				contentType: 'application/json',
				success: function (root) {
					if(root.success) {
						self.showTips('ok', '成功加入购物车');
						self.load();
					} else {
						self.showTips('error', root.message);
					}
				}
			});
		},

		updateQty: function (params) {
			var self = this;

			ajax.invoke({
				type: 'POST',
				url: '/epc/cart/operation',
				data: JSON.stringify(params),
				contentType: 'application/json',
				success: function (root) {
					if(root.success) {
						self.showTips('ok', '更新成功');
						self.load();
					} else {
						self.showTips('error', root.message);
					}
				}
			});
		},

		showTips: function (type, msg) {
			var self = this;

			clearTimeout(self.timer);
			$.showTips(type, msg);
			self.timer = setTimeout(function () {
				$.hideTips();
			}, 3000);
		}

	};

	return MiniCart;

});