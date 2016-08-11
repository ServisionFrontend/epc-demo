/*!
 * grid component
 * version 1.0-2015.12.29
 * @requires
 */
;
(function($) {

	function setup(ajax, mustache) {
		var Grid = function(options) {
			this.opts = $.extend(true, {}, defaultOpts, options || {});

			this.init();
		}

		Grid.prototype = {

			init: function() {
				var self = this;

				self.buildEl();
				self.buildTpl();
				self.initEvents();
				self.buildUrl();
			},

			buildEl: function() {
				var self = this;

				self.$gridWrap = $('#' + self.opts.gridWrapId);
				self.$gridTpl = self.$gridWrap.find('script[type="text/template"]');
				self.$gridResult = self.$gridWrap.find('[data-id=grid-result]');
			},

			buildTpl: function() {
				var self = this;

				self.tpl = self.$gridTpl.html();
			},

			buildUrl: function() {
				var self = this;

				self.urls = self.getUrls();
			},

			initEvents: function() {
				var self = this;

				if (self.opts.search) {
					self.opts.search.on('onQuery', function(params) {
						self.resetPaging();
						self.load();
					});
				}

				if (self.opts.paging) {
					self.opts.paging.on('onSelectPage', function() {
						self.load();
					});
				}

				self.$gridResult.on('click', 'tr', function(e) {
					self.rowClicked(this, e);
				});
			},

			resetPaging: function() {
				var self = this;

				if (self.opts.paging) {
					self.opts.paging.reset();
				}
			},

			rowClicked: function(target, e) {
				var self = this,
					rowNumber = $(target).attr('data-rownumber'),
					selections = self.getSelections(rowNumber);

				if (self.opts.callbacks.onRowClicked !== null) {
					self.opts.callbacks.onRowClicked.apply(target, [selections, e]);
				}
			},

			getSelections: function(rowNumber) {
				var self = this,
					i = 0,
					selections = [],
					data = self.data;

				for (; i < data.length; i++) {
					if (data[i]['rowNumber'].toString() === rowNumber) {
						selections.push(data[i]);
					}
				}

				return selections;
			},

			beforeLoad: function(params) {
				var self = this;

				if (typeof self.opts.callbacks.onBeforeLoad === 'function') {
					self.opts.callbacks.onBeforeLoad.apply(this, [params]);
				} 
			},

			load: function(params) {
				var self = this,
					params = self.getParams();

				self.beforeLoad(params);

				ajax.invoke({
					url: self.urls.read,
					cache: false,
					data: {
						args: JSON.stringify(params)
					},
					complete: function() {
						self.requestComplete();
					},
					success: function(result) {
						self.afterLoad(result);
					}
				});
			},

			requestComplete: function() {
				var self = this;

				if (typeof self.opts.callbacks.onRequestComplente === 'function') {
					self.opts.callbacks.onRequestComplente.apply();
				}
			},

			afterLoad: function(result) {
				if (typeof this.opts.callbacks.onAfterLoad === 'function') {
					this.opts.callbacks.onAfterLoad.apply(null, [result]);
				}
				var self = this,
					total = result.total || 0,
					data = self.buildData(result.list);

				self.data = data;
				self.render(data);
				if (self.opts.paging) {
					self.opts.paging.setPagination(total);
				}
			},

			buildData: function(list) {
				var self = this,
					i = 0,
					data = list || [],
					paging = self.opts.paging,
					curPage = paging ? paging.curPage : 1,
					pageSize = paging ? paging.pageSize : 1;

				for (; i < data.length; i++) {
					data[i].rowNumber = parseInt(curPage - 1) * parseInt(pageSize) + (i + 1);
				}

				return data;
			},

			getParams: function() {
				var self = this,
					search = self.opts.search,
					paging = self.opts.paging,
					searchParams = search ? search.getParams() : {},
					pagingParams = paging ? paging.getPagination() : {};

				return {
					paging: pagingParams,
					filters: searchParams,
					sorts: []
				};
			},

			getUrls: function() {
				var self = this,
					urls = self.$gridWrap.attr('data-urls') || '{}';

				return JSON.parse(urls);
			},

			render: function(data) {
				var self = this,
					html = mustache.render(self.tpl, {
						list: data
					});

				self.$gridResult.html(html);
				if(typeof self.opts.callbacks.onAfterRender === 'function') {
					self.opts.callbacks.onAfterRender.apply(null);
				}
			},

			clearEmpty: function() {
				var self = this;

				self.data = [];
				self.$gridResult.html('');
			}
		};

		var defaultOpts = {
			callbacks: {
				onRowClicked: null,
				onBeforeLoad: null,
				onAfterLoad: null,
				onButtonClick: null,
				onAfterRender: null
			}
		};

		return Grid;
	}

	define(['ajax', 'mustache', 'json2'], setup);

})(jQuery);