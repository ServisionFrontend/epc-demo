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
				searchWrapId: 'order-detail-query'
			});
			self.paging = new Paging({
				pagingWrapId: 'order-detail-paging'
			});
			self.grid = new Grid({
				gridWrapId: 'order-detail-grid',
				search: self.search,
				paging: self.paging,
				callbacks: {
					onRowClicked: function (selections, e) {
						var action = $(e.target).attr('data-action');
						if(action === 'add-cart') {
							self.header.miniCart.addGoods({
								partNo: selections[0].partNo
							});
						}
					}
				}
			});
			self.search.query();
		}

	};

	order.init();

});