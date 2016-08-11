define(['search', 'grid', 'jquery', 'colResizable', 'jqExtend', 'showLoading'], function(Search, Grid) {

	var defaultOpts = {
		callbacks: {
			onClickedSupersessionDetail: null
		}
	};

	var SupersessionSearch = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	SupersessionSearch.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.initComponent();
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#supersession-search-dialog');
			self.$tip = self.$dialog.find('.tips');
			self.$gridTable = self.$dialog.find('#supersession-search-grid-table');
		},

		initComponent: function () {
			var self = this;

			self.search = new Search({
				searchWrapId: 'supersession-search-query',
				callbacks: {
					beforeQuery: function (params) {
						if(!params.partNo) {
							self.showTips('请输入配件件号');
							return false;
						} else {
							self.hideTips();
							return true;
						}
					},
					onReset: function () {
						self.hideTips();
					}
				}
			});
			self.grid = new Grid({
				search: self.search,
				gridWrapId: 'supersession-search-grid',
				callbacks: {
					onRowClicked: function (selections, e) {
						var action = $(e.target).attr('data-action');
						if(action === 'supersession-detail') {
							self.showSupersessionDetail($(e.target));
						}
					},
					onBeforeLoad: function () {
						self.$dialog.showLoading();
					},
					onAfterLoad: function () {
						self.$dialog.hideLoading();
					}
				}
			});
		},

		showTips: function (text) {
			var self = this;

			self.$tip.removeClass('hide').find('.text').text(text);
		},

		hideTips: function () {
			var self = this;

			if(!self.$tip.hasClass('hide')) {self.$tip.addClass('hide');}
		},

		setFieldsVal: function (obj) {
			var self = this,
				key, $el;

			for(key in obj) {
				$el = self.$query.find('[data-name=' + key + ']');
				if($el.length > 0) {
					$el.val(obj[key]);
				}
			}
			self.load();
		},
		
		open: function (obj) {
			var self = this;

			$.showBlockUI({
				message: self.$dialog,
				name: 'supersession-search',
				onBlock: function () {
					if(obj) {
						self.search.setFieldsVal(obj);
						self.search.query();
					}
				},
				onUnblock: function () {
					self.search.reset();
					self.grid.clearEmpty();
				}
			});

			self.$gridTable.colResizable({
				disabledColumns: []
			});
		},

		showSupersessionDetail: function ($target) {
			var self = this;

			if(typeof self.opts.callbacks.onClickedSupersessionDetail === 'function') {
				params = {};
				params['code'] = $target.attr('data-code');
				self.opts.callbacks.onClickedSupersessionDetail.apply(this, [params, self.$dialog]);
			}
		}

	};

	return SupersessionSearch;

});