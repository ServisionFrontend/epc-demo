require(['ajax', 'thumbsImg', 'supplier', 'supersession', 'kit', 'header', 'jquery', 'jqExtend'], 
	function (ajax, ThumbsImg, Supplier, Supersession, Kit, Header) {

	var detail = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
			self.initComponent();
			self.initTab();
		},

		bindEls: function () {
			var self = this;

			self.$tabList = $('#tab-list');
			self.$tableList = $('#table-list');
			self.$focusImg = $('#focus-img');
			self.$buy = $('#detail-buy');
		},

		bindEvent: function () {
			var self = this;

			self.$tabList.on('click', 'a[data-field]', function () {
				self.checkedTab($(this));
				self.toggleTable($(this).attr('data-field'));
			});

			self.$buy.click(function () {
				self.header.addToCart({partNo: self.$buy.attr('data-partNo')});
			});
		},

		initComponent: function () {
			var self = this;

			self.header = new Header();
			self.thumbsImg = new ThumbsImg();
			self.supplier = new Supplier();
			self.supersession = new Supersession({
				callbacks: {
					onClickedSupersessionDetail: function (params) {
						self.header.supersessionDetail.open(params);
					}
				}
			});
			self.kit = new Kit();
		},

		initTab: function () {
			var self = this,
				field = $.getParameterByName('field');

			if(field.length > 0) {
				self.$tabList.find('[data-field=' +field+ ']').trigger('click');
			} else {
				self.$tabList.find('[data-field]:first').trigger('click');
			}
		},

		checkedTab: function ($target) {
			var self = this;

			self.$tabList.find('a[data-field]').removeClass('checked');
			$target.addClass('checked');
		},

		toggleTable: function (field) {
			var self = this;

			self.$tableList.find('[data-field=' + field + ']').show().siblings().hide();
		}

	};

	detail.init();

})