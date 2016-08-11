require(['ajax', 'header', 'search', 'paging', 'grid'], function (ajax, Header, Search, Paging, Grid) {

	var historyCart = {

		init: function () {
			var self = this;

			self.initComponent();
			self.bindEls();
			self.bindEvent();
		},

		initComponent: function () {
			var self = this;

			self.header = new Header();
			self.search = new Search({
				searchWrapId: 'history-cart-query'
			});
			self.paging = new Paging({
				pagingWrapId: 'history-cart-paging'
			});
			self.grid = new Grid({
				gridWrapId: 'history-cart-grid',
				search: self.search,
				paging: self.paging
			});
			self.search.query();
		},

		bindEls: function () {},

		bindEvent: function () {}

	};

	historyCart.init();

});