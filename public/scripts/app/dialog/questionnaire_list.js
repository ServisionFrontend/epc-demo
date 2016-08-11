define(['ajax','mustache','dialog','moment','showLoading','jquery', 'colResizable'], function(ajax, Mustache, Dialog, moment) {
	var defaultOpts = {
		questionnaireLayer: '#questionnaire-list-dialog',
		questionnaireLayerContent: '.layer-cont-wrapper',
		questionnaireTempl: '#questionnaire-list-templ',
		questionnaireWrapper: '#questionnaire-list-wrapper',
		searchLinkCls: ".search-link",
		callbacks: {
			onSearch: null
		}

	};

	var questionnaire = function(opts) {
		this.opts = $.extend(true, {}, defaultOpts, opts || {});
		this.init();
	};

	questionnaire.prototype = {
		init: function() {
			var self = this;

			this.initEls();
			this.initEvents();
		},

		initEls: function() {
			var self = this;

			self.questionnaireLayer = $(self.opts.questionnaireLayer);
			self.layerContent = self.questionnaireLayer.find(self.opts.questionnaireLayerContent);
			self.questionnaireTempl = self.questionnaireLayer.find(self.opts.questionnaireTempl);
			self.questionnaireWrapper = self.questionnaireLayer.find(self.opts.questionnaireWrapper);
			self.$gridTable = $('#questionnaire-list-grid-table');
		},

		initEvents: function() {
			var self = this;

			$(document).on('click', self.opts.searchLinkCls, function(e) {
				if(typeof self.opts.callbacks.onSearch === 'function') {
					self.opts.callbacks.onSearch.call(null,$(this));
				}
			});
		},

		open: function() {
			var self = this;

			$.showBlockUI({
				message: self.questionnaireLayer,
				name: '问卷调查',
				onBlock: function() {
					self.getQestionnaireList();
				}
			});

			self.$gridTable.colResizable({
				disabledColumns: []
			});
		},

		getQestionnaireList: function() {
			var self = this;

			ajax.invoke({
				url: '/common/getQuestionnaireList',
				type: 'GET',
				beforeSend: function() {
					self.layerContent.showLoading();
				},
				success: function (data) {
					self.reconstructData(data);
					
				},
				failed: function(data) {
					new Dialog({
						type: 'error',
						title: '提示',
						content: data.message || '查询失败'
					});
				},
				complete: function() {
					self.layerContent.hideLoading();
				}
			})
		},

		reconstructData: function(data) {
			var self = this;

			for(var i=0; i<data.length; i++) {
				var item = data[i];

				item.createTime = item.issueOn ? moment(item.issueOn).format('YYYY-MM-DD HH:mm:ss') : '';
				item.number = i+1;
			}
			self.renderTempl(data);
		},

		renderTempl: function(data) {
			var self = this,
				templ = self.questionnaireTempl.html();

				self.questionnaireWrapper.html(Mustache.render(templ, {list: data}));
		}
	};

	return questionnaire;
})