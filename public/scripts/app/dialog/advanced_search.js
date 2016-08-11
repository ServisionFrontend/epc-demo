define(['grid', 'search', 'paging', 'jquery', 'colResizable', 'jqExtend', 'showLoading'], function(Grid, Search, Paging) {

	var defaultOpts = {
		callbacks: {
			onBuy: null
		}
	};

	var AdvancedSearch = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	AdvancedSearch.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindEvent();
			self.initComponent();
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#advanced-search-dialog');
			self.$query = $('#advanced-search-query');
			self.$grid = $('#advanced-search-grid');
			self.$gridTable = $('#advanced-search-grid-table');
			self.$searchLevel = $('#advanced-level-select');
			self.$tip = self.$dialog.find('[data-itemId=tip]');
		},

		bindEvent: function () {
			var self = this;

			self.$dialog.find('[data-itemId=brand]').on('evtChange', function () {
				self.$tip.addClass('hide');
			});

			self.$searchLevel.on('evtChange', function () {
				self.changeSearchLevel($(this).find('input').val(), false);
			});

		},

		initComponent: function () {
			var self = this;

			self.search = new Search({
				callbacks:{
					onSelectRenderFinish: function () {
						if(self.autoQuery) {
							self.search.query();
						}
					},
					beforeQuery:function(params){
						if(!params.brandCode) {
							self.$tip.removeClass('hide').find('.text').text('请选择品牌');
							return false;
						} else {
							if(!self.$tip.hasClass('hide')) self.$tip.addClass('hide');
							return true;
						}
					},
					onReset: function () {
						if(!self.$tip.hasClass('hide')) self.$tip.addClass('hide');
					}
				},
				searchWrapId: 'advanced-search-query',
				selectFields: [{
						name: 'brandCode',
						root: 'list',
						clearTargets: ['seriesCode', 'modelGroupCode', 'modelCode', 'groupCode', 'subGroupCode'],
						nextTargets: ['seriesCode'],
						noParams: true
					}, {
						name: 'seriesCode',
						depend: ['brandCode'],
						root: 'list',
						clearTargets: ['modelGroupCode', 'modelCode', 'groupCode', 'subGroupCode'],
						nextTargets: ['modelGroupCode']
					}, {
						name: 'modelGroupCode',
						depend: ['seriesCode'],
						root: 'list',
						clearTargets: ['modelCode', 'groupCode', 'subGroupCode'],
						nextTargets: ['modelCode']
					}, {
						name: 'modelCode',
						depend: ['modelGroupCode'],
						root: 'list',
						clearTargets: ['subGroupCode'],
						nextTargets: ['groupCode']
					}, {
						name: 'groupCode',
						depend: ['modelCode'],
						root: 'list',
						clearTargets: ['subGroupCode'],
						nextTargets: ['subGroupCode']
					}, {
						name: 'subGroupCode',
						depend: ['groupCode'],
						root: 'list'
					}]
			});
			self.paging = new Paging({
				pagingWrapId: 'advanced-search-paging'
			});
			self.grid = new Grid({
				gridWrapId: 'advanced-search-grid',
				search: self.search,
				paging: self.paging,
				callbacks: {
					onBeforeLoad: function () {
						var readUrl = this.urls.read,
							index = readUrl.indexOf('?'),
							url = index == -1 ? readUrl : readUrl.slice(0, index);

						this.urls.read = url + '?queryLevelCode=' + self.$searchLevel.find('input').val();
						self.changeSearchLevel(self.$searchLevel.find('input').val(), true);
						self.$dialog.showLoading();
					},
					onRowClicked: function (selections, e) {
						if($(e.target).attr('data-action') == 'add-cart') {
							if(typeof self.opts.callbacks.onBuy === 'function') {
								self.opts.callbacks.onBuy.apply(null, [{partNo: selections[0].partNo}]);
							}
						}
					},
					onAfterRender: function () {
						self.toggleGridCont(self.$searchLevel.find('input').val());
					},
					onRequestComplente: function () {
						self.$dialog.hideLoading();
					}
				}
			});

		},

		open: function (autoQuery, params) {
			var self = this;

			self.autoQuery = autoQuery;
			if(params){
				self.search.setFieldsVal(params);
			} else {
				self.search.loadDropDownData();
			}
			$.showBlockUI({
				message: self.$dialog,
				name: 'advanced-search',
				onUnblock: function () {
					self.search.reset();
					self.grid.clearEmpty();
					self.paging.clearEmpty();
				}
			});

			self.$gridTable.colResizable({
				disabledColumns: []
			});
		},

		checkLevel: function (level) {
			var self = this;

			self.$searchLevel.find('li[data-value='+level+']').trigger('click');
		},


		changeSearchLevel: function (level,deep) {
			var self = this,
				fields = [], noClearOption;

			self.clearDisabled();
			if(level == 'MODELGROUP') {
				noClearOption = 'modelCode';
				fields = ['modelCode', 'groupCode', 'subGroupCode', 'imageCode', 'imageName'];
			} else if(level == 'SERIES') {
				noClearOption = 'modelGroupCode';
				fields = ['modelGroupCode', 'modelCode', 'groupCode', 'subGroupCode', 'imageCode', 'imageName'];
			}
			self.clearval(fields, noClearOption);
			self.disabledField(fields);
			if(deep) {
				self.toggleGridCont(level);
			}
			
		},

		clearDisabled: function () {
			var self = this;

			self.$query.find('[data-name]').removeAttr('disabled');
			self.$query.find('.form-select').removeClass('disabled');
		},

		clearval: function (fields, noClearOption) {
			var self = this,
				$el;

			if(fields.length === 0) return;

			for(var i = 0; i < fields.length; i++) {
				$el = self.$query.find('[data-name='+fields[i]+']');
				self.search.clearVal($el);
				if(fields[i] != noClearOption) {
					self.search.clearOption($el);
				} 
			}
		},

		disabledField: function (fields) {
			var self = this,
				$el;

			if(fields.length == 0) return;

			for(var i = 0; i < fields.length; i++) {
				$el = self.$query.find('[data-name='+fields[i]+']');
				if($el.attr('data-type') == 'select') {
					$el.closest('.form-select').addClass('disabled');
				} else {
					$el.attr('disabled', 'disabled');
				}
			};
		},

		toggleGridCont: function (level) {
			var self = this;

			self.$grid.find('[data-field]').show();
			if(level == 'MODEL') {
				self.$grid.find('[data-action=goto-catalog]').show();
			} else if(level == 'MODELGROUP') {
				fields = ['qty','modelName','imageCode','imageName'];
				self.hideGridEls(fields);
				self.$grid.find('[data-action=goto-catalog]').hide();
			} else if(level == 'SERIES') {
				fields = ['qty','modelName', 'modelGroupName','imageCode','imageName'];
				self.hideGridEls(fields);
				self.$grid.find('[data-action=goto-catalog]').hide();
			}
		},

		hideGridEls: function (fields) {
			var self = this;

			for(var i = 0; i < fields.length; i++) {
				self.$grid.find('[data-field='+fields[i]+']').hide();
			}
		}

	};

	return AdvancedSearch;

});