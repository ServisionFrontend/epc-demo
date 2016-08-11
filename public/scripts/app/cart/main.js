require(['header', 'search', 'paging', 'grid', 'ajax', 'dialog', 'jquery', 'jqExtend', 'showLoading', 'numbox'], 
	function (Header, Search, Paging, Grid, ajax, Dialog) {

	var cart = {

		init: function () {
			var self = this;

			self.initComponent();
			self.bindEls();
			self.bindAttr();
			self.bindEvent();
		},

		initComponent: function () {
			var self = this;

			self.header = new Header();
			self.search = new Search({
				searchWrapId: 'cart-grid-query'
			});
			self.paging = new Paging({
				pagingWrapId: 'cart-grid-paging'
			});
			self.grid = new Grid({
				search: self.search,
				paging: self.paging,
				gridWrapId: 'cart-grid',
				callbacks: {
					onRowClicked: function (selections, e) {
						self.clickedRow(selections, e);
					},
					onBeforeLoad: function () {
						self.grid.$gridWrap.showLoading();
					},
					onAfterLoad: function () {
						self.grid.$gridWrap.hideLoading();
					},
					onAfterRender: function () {
						self.$gridBody.numbox('controlAllBtnsStatus');
					}
				}
			});
			self.search.query();
		},

		bindEls: function () {
			var self = this;

			self.$grid = $('#cart-grid');
			self.$gridBody = self.$grid.find('[data-id=grid-result]');
			self.$deleteAll = $('#delete-all');
			self.$checkAll = $('[data-itemId=check-all]');
		},

		bindAttr: function () {
			var self = this;

			self.timer = null;
		},

		bindEvent: function () {
			var self = this;

			self.$checkAll.click(function () {
				self.checkAll($(this));
			});

			self.$deleteAll.click(function () {
				self.deleteAll();
			});

			self.$gridBody.numbox({
				onchange: function (val, $target) {
					var $tr = $target.closest('tr'),
						id = $tr.attr('data-id'),
						min = JSON.parse($target.closest('[data-itemId=qty-box]').attr('data-min'));

					if($target.get(0).tagName.toUpperCase() == 'INPUT') {
						if(val % min !== 0) {
							val = (Math.ceil(val/min)) * min;
							self.showDialog(val, $target, id, min);
						} else {
							self.updateQty({id: id, qty: val});
						}
					} else {
						self.updateQty({id: id, qty: val});
					}
				}
			});
		},

		clickedRow: function (selections, e) {
			var self = this,
				action = $(e.target).attr('data-action');

			switch (action) {
				case 'delete':
					self.showBtns($(e.target));
					break;
				case 'confirm':
					self.deleteGoods(self.getSingleId($(e.target)));
					break;
				case 'cancel':
					self.hideBtns($(e.target));
					break;
				case 'check':
					self.checkSingle();
					break;
				default:
					break;
			}

		},

		deleteAll: function () {
			var self = this,
				$checkedEls = self.$grid.find(':checked');

			if($checkedEls.length > 0) {
				new Dialog({
					type: 'warn',
					content: '是否确认删除？',
					cancelBtn: true,
					onConfirm: function () {
						self.deleteGoods(self.getIds(), function () {
							self.$checkAll.prop('checked', false);
						});
					}
				});
			} else {
				new Dialog({
					type: 'warn',
					content: '请选择需要删除的商品'
				})
			}
		},

		deleteGoods: function (ids, cb) {
			var self = this;

			ajax.invoke({
				type: 'DELETE',
				url: '/epc/cart/operation',
				data: JSON.stringify({'ids':ids}),
				contentType: 'application/json',
				success: function (root) {
					if(root.success) {
						self.showTips('ok', '删除成功');
						self.paging.gotoPage();
						self.header.miniCart.load();
						if(typeof cb == 'function') {
							cb();
						}
					} else {
						self.showTips('error', root.message);
					}
				}
			});
		},

		getSingleId: function ($target) {
			var self = this,
				$tr = $target.closest('tr'),
				id = $tr.attr('data-id') || '';

			return [id];
		},

		getIds: function () {
			var self = this,
				$checkedEls = self.$gridBody.find(':checked'),
				ids = [];

			for(var i = 0; i < $checkedEls.length; i++) {
				ids.push($checkedEls.eq(i).closest('tr').attr('data-id'));
			}

			return ids;
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
						self.showTips('ok', '修改成功');
						self.paging.gotoPage();
						self.header.miniCart.load();
					} else {
						self.showTips('error', root.message);
					}
				}
			});
		},

		checkSingle: function () {
			var self = this,
				$checkbox = self.$gridBody.find('[type=checkbox]'),
				$checkedEls = self.$gridBody.find(':checked');

			if($checkedEls.length === $checkbox.length) {
				self.$checkAll.prop('checked', true);
			} else {
				self.$checkAll.prop('checked', false);
			}
		},

		checkAll: function ($target) {
			var self = this;

			if($target.is(':checked')) {
				self.$gridBody.find('[type=checkbox]').prop('checked', true);
				self.$checkAll.prop('checked', true);
			} else {
				self.$gridBody.find('[type=checkbox]').prop('checked', false);
				self.$checkAll.prop('checked', false);
				
			}
		},

		showTips: function (type, message) {
			var self = this;

			clearTimeout(self.timer);
			$.showTips(type, message);
			setTimeout(function () {
				$.hideTips();
			}, 3000);
		},

		showBtns: function ($target) {
			var self = this,
				$parent = $target.closest('td');

			$target.closest('.delete').addClass('hide');
			$parent.find('.btn').removeClass('hide');
		},

		hideBtns: function ($target) {
			var self = this,
				$parent = $target.closest('td');

			$parent.find('.delete').removeClass('hide');
			$parent.find('.btn').addClass('hide');
		},

		showDialog: function (val, $target, id, min) {
			var self = this;

			new Dialog({
				type: 'info',
				content: '最小包装数为:' + min + ',已圆整为:' + val,
				onConfirm: function () {
					self.$gridBody.numbox('setVal', {val: val, target: $target});
					self.updateQty({id: id, qty: val});
				}
			});
		}

	};

	cart.init();

});