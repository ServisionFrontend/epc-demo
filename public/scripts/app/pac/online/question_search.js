require(['ajax', 'grid', 'search', 'paging', 'mustache', 'dialog', 'header', 'moment', 'jquery', 'select', 'carCatalogSelect'], 
	function(ajax, Grid, Search, Paging, Mustache, Dialog, Header, moment) {
	var search = {
		init: function () {
			var self = this;

			self.bindEls();
			self.buildAttrs();
			self.getQuestionsClassify();
			self.getSeriousStatus();
			self.buildComponent();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$tab = $('#tab');
			self.$tabCont = $('#tab-cont');
			self.$questionForm = $('#question-form');
			self.seriesSelect = $('[data-sign="series"]');
			self.$submitBtn = $('a[data-id="submit"]');
			self.$resetBtn = $('a[data-id="reset"]');

			self.statusWrapper = $('#important-status-wrapper');
			self.statusTempl = $('#important-status-template');

			self.deepGroupWrapper = $('#deep-group');
			self.deepGroupTempl = $('#deep-group-template');
		},

		buildAttrs: function() {
			var self = this;

			self.urlArray = ['/pac/online', '/pac/online/question_search', '/pac/online/myquestion'];
		},

		buildComponent: function() {
			var self = this;

			var header = new Header();
			self.search = new Search({
				searchWrapId: 'question-form'
			});
			self.paging = new Paging({
				pagingWrapId: 'question-search-paging'
			});
			self.grid = new Grid({
				gridWrapId: 'question-table',
				search: self.search,
				paging: self.paging,
				callbacks: {
					onAfterLoad: function(result) {
						self.formatListDate(result);
					}
				}
			});
			self.grid.load();
			self.$tabCont.carCatalogSelect({needGroups: false});
		},

		bindEvent: function () {
			var self = this;

			self.$tab.on('click', '[data-field]', function () {
				self.toggleTab($(this));
			});
			self.$resetBtn.on('click', function() {
				self.$questionForm.get(0).reset();
				self.resetSelect(self.$questionForm);
			});
			$(document).on('click', '[data-action="goto-detail"]', function() {
				self.gotoDetail($(this));
			});
		},

		toggleTab: function ($this) {
			var self = this;

			var index = $this.attr('data-field');
			if($this.hasClass('checked')) { return; }
			window.location.href = globalConfig.context.path + self.urlArray[index];
		},

		getQuestionsClassify: function() {
			var self = this;

			ajax.invoke({
				url: '/pac/online/questionType',
				type: 'GET',
				success: function (data) {
					self.renderTemplate(data, self.deepGroupTempl, self.deepGroupWrapper);
				}
			 });
		},

		getSeriousStatus: function() {
			var self = this;

			ajax.invoke({
				url: '/pac/online/seriousStatus',
				type: 'GET',
				success: function (data) {
					self.renderTemplate(data, self.statusTempl, self.statusWrapper);
				}
			 });
		},

		renderTemplate: function(data, $templ, $dom) {
			var self = this;

			var template = $templ.html(), html;

			html = Mustache.render(template, {data: data});

			$dom.html(html);
		},

		resetSelect: function($form) {
			var self = this;

			$form.find('.form-select').find('.form-select-input').val('').end()
				.find('.form-select-text').text('请选择').attr('title', '请选择');
			self.seriesSelect.addClass('disabled');
		},

		gotoDetail: function($this) {
			var self = this;

			var code = $this.closest('tr').attr('data-code'),
				url = globalConfig.context.path + '/pac/online/detail?questionCode=' + code;

			window.open(url,'_blank');
		},

		formatListDate: function(result) {
			var self = this;

			for(var i=0;i<result.list.length; i++) {
                        
                result.list[i].createdOn = moment(result.list[i].createdOn).format('YYYY-MM-DD HH:mm:ss');
                result.list[i].firstReplyOn = result.list[i].firstReplyOn ? moment(result.list[i].firstReplyOn).format('YYYY-MM-DD HH:mm:ss') : '';
                result.list[i].lastReplyOn = result.list[i].lastReplyOn ? moment(result.list[i].lastReplyOn).format('YYYY-MM-DD HH:mm:ss') : '';
            }
		}
	}
	search.init();
})