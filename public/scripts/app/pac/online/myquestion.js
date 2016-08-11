require(['ajax', 'grid', 'search', 'paging', 'mustache', 'dialog', 'moment','pikaday',  'qustionCloseAction', 'header', 'jquery', 'select', 'jqExtend'], 
	function(ajax, Grid, Search, Paging, Mustache, Dialog, moment, Pikaday, CloseAction, Header) {
		
	var myquestion = {
		init: function () {
			var self = this;

			self.bindEls();
			self.buildLayerEls();
			self.buildAttrs();
			self.getQuestionsClassify();
			self.getQuestionStatus();
			self.buildComponent();
			self.bindEvent();
		},
 
		bindEls: function () {
			var self = this;

			self.$tab = $('#tab');
			self.$tabCont = $('#tab-cont');
			self.$questionForm = $('#question-form');
			self.$resetBtn = $('a[data-id="reset"]');
			self.gridResult = $('[data-id="grid-result"]');

			self.startDateInput = $('#search-date-start-input');
			self.endDateInput = $('#search-date-end-input');
			

			self.statusWrapper = $('#question-status-wrapper');
			self.statusTempl = $('#question-status-template');

			self.deepGroupWrapper = $('#deep-group');
			self.deepGroupTempl = $('#deep-group-template');

			self.brandSelectWrapper = $('#brand-select-wrapper');
			self.brandSelectTemplate = $('#brand-select-template');
		},

		buildLayerEls: function() {
			var self = this;

			self.$questionCommentForm = $('.question-comment-form');
			self.questionId = $('#question-code');
			self.questionCode = $('[data-name="question-number"]');
			self.questionStatus = $('[data-name="question-status"]');
			self.questionSubject = $('[data-name="question-subject"]');
		},

		buildAttrs: function() {
			var self = this;

			self.urlArray = ['/pac/online', '/pac/online/question_search', '/pac/online/myquestion'];
			self.loadCount = 0;
			self.i18n = {
	            previousMonth : '上月',
	            nextMonth     : '下月',
	            months        : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
	            weekdays      : ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
	            weekdaysShort : ['日','一','二','三','四','五','六']
	        };
	        self.limitNum = 200;
		},

		buildComponent: function() {
			var self = this;

			var header = new Header();
			self.getBrand();
			self.createCalendar();
			self.search = new Search({
				searchWrapId: 'question-form',
				callbacks: {
					onGetParamsAfter: function (params) {
						if(params.dateBefore) {
							var date = moment(params.dateBefore).add(1, 'day');
							params.dateBefore = date.format('YYYY-MM-DD');
						}
					}
				}
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
					},
					onAfterRender: function() {
						self.hideCloseBtnByStatus();
					}
				}
				
			});
			self.grid.load();
			self.qustionCloseAction = new CloseAction({
				callbacks: {
					onConfirm: function() {
						self.closeLayer();
						self.grid.load();
					}
				}
			});
		},

		createCalendar:function(){
            var self = this;

            self.startDate = new Pikaday({
            	field: $('#search-date-start-input')[0],
            	i18n : self.i18n
            });
            self.endDate = new Pikaday({
            	field: $('#search-date-end-input')[0],
            	i18n : self.i18n
            });
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
			$(document).on('click', '[data-action="close-question"]', function() {
				self.openLayer($(this));
			});
			$(document).on('click', '[data-action="cancel"]', function() {
				self.closeLayer();
			});
		},

		toggleTab: function ($this) {
			var self = this;

			var index = $this.attr('data-field');
			if($this.hasClass('checked')) { return; }
			window.location.href = globalConfig.context.path + self.urlArray[index];
		},

		getBrand: function() {
			var self = this;

			ajax.invoke({
				url: '/pac/online/brand',
				type: 'GET',
				success: function (data) {
					self.renderTemplate(data, self.brandSelectTemplate, self.brandSelectWrapper);
				}
		 	});
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

		getQuestionStatus: function() {
			var self = this;

			ajax.invoke({
				url: '/pac/online/questionStatus',
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
			
		},

		gotoDetail: function($this) {
			var self = this;

			var code = $this.closest('tr').attr('data-code'),
				url = globalConfig.context.path + '/pac/online/detail?questionCode=' + code;

			window.open(url,'_blank');
		},

		openLayer: function ($this) {
			var self = this;

			$.showBlockUI({
				message: $('#question-close-dialog'),
				name: 'question-close',
				onBlock: function() {
					self.setLayerValue($this);
				}			
			});
		},

		closeLayer: function() {
			var self = this;

			$.hideBlockUI({
				message: $('#question-close-dialog'),
				name: 'question-close'
			});
		},

		setLayerValue: function($this) {
			var self = this;

			var $dom = $this.closest('tr'),
				$domTd = $dom.find('td'),
				questionID = $dom.attr('data-code'),
				questionCode = $domTd.eq(0).text(),
				questionStatus = $domTd.eq(1).text(),
				questionSubject = $domTd.eq(3).text();

			self.questionId.val(questionID);
			self.questionCode.find('.text-block').text(questionCode);
			self.questionStatus.find('.text-block').text(questionSubject);
			self.questionSubject.find('.text-block').text(questionStatus);
			self.$questionCommentForm.find('.form-select-option').eq(0).trigger('click');
			self.$questionCommentForm.find('.text-exist').text('0').end()
				.find('.text-remain').text(self.limitNum).end().get(0).reset();
		},

		formatListDate: function(result) {
			var self = this;

			for(var i=0;i<result.list.length; i++) {
                        
                result.list[i].createdOn = result.list[i].createdOn ? moment(result.list[i].createdOn).format('YYYY-MM-DD HH:mm:ss') : '';
                result.list[i].firstReplyOn = result.list[i].firstReplyOn ? moment(result.list[i].firstReplyOn).format('YYYY-MM-DD HH:mm:ss') : '';
                result.list[i].lastReplyOn = result.list[i].lastReplyOn ? moment(result.list[i].lastReplyOn).format('YYYY-MM-DD HH:mm:ss') : '';
            }
		},

		hideCloseBtnByStatus: function() {
			var self = this;

			self.gridResult.find('tr').each(function(index, element) {
				var $element = $(element),
					status = $element.attr('data-status');

					if(status == '2') {
						$element.find('[data-action="close-question"]').remove();
					}
			})
		}
		
	}
	myquestion.init();
})