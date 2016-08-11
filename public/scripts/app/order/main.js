require(['ajax', 'header', 'search', 'paging', 'grid'], function (ajax, Header, Search, Paging, Grid) {

	var order = {

		init: function () {
			var self = this;

			self.initComponent();
		},

		initComponent: function () {
			var self = this;

			self.header = new Header();
			self.search = new Search({
				searchWrapId: 'order-query'
			});
			self.paging = new Paging({
				pagingWrapId: 'order-paging'
			});
			self.grid = new Grid({
				gridWrapId: 'order-grid',
				search: self.search,
				paging: self.paging,
				callbacks: {
					onRowClicked: function (selections, e) {
						var action = $(e.target).attr('data-action');
						if(action === 'delete') {
							self.clickedDelete($(e.target));
							return;
						}
						if(action === 'confirm') {
							self.deleteOrder({ids:[selections[0].id]});
							return;
						}
						if(action === 'cancel') {
							self.clickedCancel($(e.target));
							return;
						}
					}
				}
			});
			self.search.query();
		},

		clickedDelete: function ($target) {
			var self = this,
				$parent = $target.closest('.operation');

			$target.parent().addClass('hide');
			$parent.find('.btn').removeClass('hide');
		},

		deleteOrder: function (params) {
			var self = this;

			ajax.invoke({
				type: 'POST',
				url: '/epc/order/deleteOrder',
				contentType: 'application/json',
				data: JSON.stringify(params),
				success: function () {
					self.search.query();
				}
			});
		},

		clickedCancel: function ($target) {
			var self = this,
				$parent = $target.closest('.operation');

			$parent.find('.btn').addClass('hide');
			$parent.find('[data-action=delete]').parent().removeClass('hide');
		}

	};

	order.init();

});