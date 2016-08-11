define(['ajax', 'mustache', 'grid', 'search', 'paging', 'dialog', 'moment', 'pikaday', 'jquery', 'colResizable', 'jqExtend', 'showLoading', 'select'],
	function(ajax, Mustache, Grid, Search, Paging, Dialog, moment, Pikaday) {

	defaultOpts = {
		callbacks: {
			onReloadCount: null
		}
	};

	var Notice = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	Notice.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.initComponent();			
			self.bindEvent();
			self.loadType();
		},

		initComponent: function () {
			var self = this;

			self.search = new Search({
				searchWrapId: 'notice-query',
				callbacks: {
					onGetParamsAfter: function (params) {
						if(params.issueAfter) {
							params.issueAfter = moment(params.issueAfter).format('YYYY-MM-DD');
						}
						if(params.issueBefore) {
							var date = moment(params.issueBefore).add(1, 'day');
							params.issueBefore = date.format('YYYY-MM-DD');
						}
					}
				}
			});
			self.paging = new Paging({
				pagingWrapId: 'notice-paging'
			});
			self.grid = new Grid({
				search: self.search,
				paging: self.paging,
				gridWrapId: 'notice-grid',
				callbacks: {
					onRowClicked: function (selections, e) {
						var action = $(e.target).attr('data-action');
						if(action === 'set-already') {
							self.requestSingleAlready(selections[0].code);
						}
					},
					onBeforeLoad: function () {
						self.$dialog.showLoading();
					},
					onRequestComplente: function () {
						self.$dialog.hideLoading();
					},
					onAfterLoad: function (result) {						
						var data = result.list;
						if(data) {
							for(var i = 0; i < data.length; i++) {
								data[i].date = data[i].publishOn ? moment(Number(data[i].publishOn)).format('YYYY-MM-DD hh:mm:ss') : null;
							}
						}
					}
				}
			});

			self.startDate = new Pikaday({
				field: $('#notice-start-date')[0],
				format: 'YYYY-MM-DD'
			});
			self.endDate = new Pikaday({
				field: $('#notice-end-date')[0],
				format: 'YYYY-MM-DD'
			});
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#notice-dialog');
			self.$query = $('#notice-query');
			self.$allSetAlready = self.$dialog.find('[data-itemId=all-set-already]');
			self.$noticeType = self.$query.find('[data-name=typeCode]').closest('.form-select').find('ul');
			self.$issueDateBefore = self.$query.find('[data-name=issueBefore]');
			self.$issueDateAfter = self.$query.find('[data-name=issueAfter]');
			self.$gridTable = self.$dialog.find('#notice-grid-table');
		},

		bindEvent: function () {
			var self = this;

			self.$allSetAlready.click(function () {
				self.allSetAlready();
			});
		},

		loadType: function () {
			var self = this;

			ajax.invoke({
				type: 'GET',
				url: '/epc/notice/getType',
				success: function (root) {
					self.renderType(root);
				}
			});
		},

		renderType: function (data) {
			var self = this,
				template = '<li data-value="" class="form-select-option currentOption">请选择</li>{{#list}}<li data-value="{{code}}" title="{{name}}" class="form-select-option">{{name}}</li>{{/list}}',
				output = Mustache.render(template, {list: data});

			self.$noticeType.html(output);
		},

		allSetAlready: function () {
			var self = this;

			new Dialog({
				type: 'warn',
				content: '是否确认全部设为已读',
				cancelBtn: true,
				onConfirm: function () {
					self.requestSetAlready();
				}
			});
		},

		requestSingleAlready: function (code) {
			var self = this,
				params = params ? params : {};

			ajax.invoke({
				type: 'POST',
				url: '/epc/notice/setSingleAlready',
				data: {'code': code},
				success: function () {
					self.requestSuccess();
				}
			});
		},

		requestSetAlready: function () {
			var self = this;

			ajax.invoke({
				type: 'GET',
				url: '/epc/notice/setAllAlready',
				cache: false,
				success: function () {
					self.requestSuccess();
				}
			});
		},

		requestSuccess: function () {
			var self = this;

			self.paging.doPaging();
			self.reloadCount();
		},

		reloadCount: function () {
			var self = this;

			if(typeof self.opts.callbacks.onReloadCount === 'function') {
				self.opts.callbacks.onReloadCount.apply(null);
			}
		},

		open: function () {
			var self = this;

			$.showBlockUI({
				message: self.$dialog,
				name: 'notice-search',
				onBlock: function () {
					self.search.query();
				},
				onUnblock: function () {
					self.search.reset();
				}
			});

			self.$gridTable.colResizable({
				disabledColumns: []
			});
		}

	};

	return Notice;

});