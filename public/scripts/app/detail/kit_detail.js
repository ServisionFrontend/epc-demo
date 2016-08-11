define(['search','grid', 'paging', 'jquery', 'blockUI', 'jquery', 'jqExtend'], function (Search,Grid, Paging) {

	var KitDetail = function () {
		this.init();
	};

	KitDetail.prototype = {

		init: function () {
			var self = this;

			self.initComponent();
			self.bindEls();
		},

		initComponent: function () {
			var self = this;

			self.search = new Search({
				searchWrapId: 'kit-detail-query'
			});
			self.paging = new Paging({
				pagingWrapId: 'kit-detail-paging'
			});
			self.grid = new Grid({
				gridWrapId: 'kit-detail-grid',
				search: self.search,
				paging: self.paging
			});
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#kit-detail-dialog');
			self.$kitNumber = self.$dialog.find('[data-id=kit-number]');
		},

		open: function (params) {
			var self = this;

			self.search.setFieldsVal(params);
			self.$kitNumber.text(params['kitCode'] || '');
			self.grid.load();
			$.showBlockUI({
				message: self.$dialog,
				name: 'kit-detail-dialog'
			});
		}

	};

	return KitDetail;

});