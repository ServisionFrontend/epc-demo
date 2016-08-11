define(['require', 'ajax', 'mustache', 'miniCart', 'advancedSearch', 'modifyPassword', 'modifyEmail', 'notice', 'supersessionSearch', 'userinfo', 'vinAnalysis', 'headerSearch', 'vehicleCode', 'supersessionDetail', 'questionnaireList', 'dialog', 'select', 'jquery', 'jqExtend'],
 function (require, ajax, Mustache, MiniCart, AdvancedSearch, ModifyPassword, ModifyEmail, Notice, SupersessionSearch, Userinfo, VinAnalysis, HeaderSearch, VehicleCode, SupersessionDetail, QuestionnaireList, Dialog) {

	var Header = function () {
		this.init();
	};

	Header.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.buildAttrs();
			self.initComponent();
			self.bindEvent();
			if(self.isNeed('nav-questionnaire-link')) {self.initQuestionnaire();}
			if(self.isNeed('nav-lang-link')) {self.loadLang();}
			if(self.isNeed('nav-notice-link')) {self.loadNoticeCount();}
			if(self.isNeed('nav-questionnaire-link')) {self.loadQuestionnaireCount();}
			self.initHeaderSearchVal();
			self.initOpenModifyPasswrod();
		},

		initComponent: function () {
			var self = this;

			self.advancedSearch = new AdvancedSearch({
				callbacks: {
					onBuy: function (params) {
						self.addToCart(params);
					}
				}
			});
			self.modifyPassword = new ModifyPassword();
			self.modifyEmail = new ModifyEmail();
			self.notice = new Notice({
				callbacks: {
					onReloadCount: function () {
						self.loadNoticeCount();
					}
				}
			});
			self.supersessionSearch = new SupersessionSearch({
				callbacks: {
					onClickedSupersessionDetail: function (params, parentObj) {
						self.supersessionDetail.open(params, parentObj);
					}
				}
			});
			self.userinfo = new Userinfo();
			self.vinAnalysis = new VinAnalysis();
			self.headerSearch = new HeaderSearch({
				callbacks: {
					onSearch: function (typeObj, val) {
						self.search(typeObj, val);
					}
				}
			});
			self.vehicleCode = new VehicleCode();
			self.supersessionDetail = new SupersessionDetail();
			self.miniCart = new MiniCart({
				callbacks: {
					onSetCartCount: function (count) {
						self.setCartCount(count);
					}
				}
			});
			self.questionnaireList = new QuestionnaireList({
				callbacks: {
					onSearch: function($this) {
						self.afterSearchClick($this);
					}
				}
			});
		},

		bindEls: function () {
			var self = this;

			self.$navigation = $('#page-navigation');
			self.$header = $('#page-header');
			self.$crumbs = $('#crumbs');
			self.$questionnaire = self.$navigation.find('[data-action=questionnaire]');
			self.$noticeCount = self.$navigation.find('[data-action=notice] .num-wrap');
			self.$cartCount = self.$navigation.find('[data-action=shopping-cart] .num-wrap');
			self.$questionnaireCount = self.$navigation.find('[data-action=open-questionnaire] .num-wrap');
			self.$langList = $('#nav-lang-list');
		},

		buildAttrs: function () {
			var self = this;

			self.questionnaireCount = 0;
		},

		bindEvent: function () {
			var self = this,
				action;

			self.$navigation.on('click', '[data-action]', function () {
				action = $(this).attr('data-action');
				switch (action) {
					case 'shopping-cart':
						break;
					case 'notice':
						self.notice.open();
						break;
					case 'open-questionnaire':
						self.openQuestionnaire();
						break;
					case 'user-info':
						self.userinfo.open();
						break;
					case 'modify-password':
						self.modifyPassword.open();
						break;
					case 'modify-email':
						self.modifyEmail.open();
						break;
					case 'en':
						self.changeLang(action);
						break;
					case 'zh':
						self.changeLang(action);
						break;
					default:
						break;
				}
			});

			self.$header.on('click', 'a[data-action]', function () {
				action = $(this).attr('data-action');
				switch (action) {
					case 'advanced-search':
						self.advancedSearch.open(true, self.getCrumbsData());
						break;
					case 'supersession-search':
						self.supersessionSearch.open();
						break;
					default:
						break;
				}
			});
		},

		search: function (typeObj, val) {
			var self = this,
				type = typeObj.value || '';

			switch (type) {
				case 'vin':
					self.openVinAnalysis({'key': 'vin', 'val': val});
					break;
				case 'part-no':
					self.openAdvancedSearch({'partNo': val});
					break;
				case 'part-name':
					self.openAdvancedSearch({'partName': val});
					break;
				case 'vehicle-code':
					self.openVehicleCode({'key': 'vehicleCode', 'val': val});
					break;
				default:
					break;
			}
		},

		initQuestionnaire: function () {
			var self = this;

			ajax.invoke({
				url: '/common/questionnaireExist',
				type: 'GET',
				success: function (root) {		
					if(root && root.exist) {
						self.$questionnaire.removeClass('hide');
					}
				}
			});
		},

		openQuestionnaire: function () {
			var self = this;

			self.loadQuestionnaireCount();
			self.questionnaireList.open();
		},

		openVinAnalysis: function (obj) {
			var self = this;

			self.vinAnalysis.open(obj);
		},

		openVehicleCode: function (obj) {
			var self = this;

			self.vehicleCode.open(obj);
		},

		openAdvancedSearch: function (params) {
			var self = this,
				crumbsData = self.getCrumbsData();

			if(crumbsData['brandCode']) {
				params['brandCode'] = crumbsData.brandCode;
			}

			self.advancedSearch.open(true, params);
		},

		openAdvancedFromApply: function ($row) {
			var self = this,
				partNo = $row.attr('data-partNo'),
				crumbsData = self.getCrumbsData(),
				params = {}, level;

			if(crumbsData.modelCode) {
				delete crumbsData['modelCode'];
				params = crumbsData;
				level = 'MODEL';
			} else if(crumbsData.modelGroupCode) {
				params['brandCode'] = crumbsData.brandCode;
				params['seriesCode'] = crumbsData.seriesCode;
				level = 'MODELGROUP';
			} else {
				params['brandCode'] = crumbsData.brandCode;
				level = 'SERIES';
			}

			params['partNo'] = partNo;
			self.advancedSearch.checkLevel(level);
			self.advancedSearch.open(true, params);
		},

		openSupersession: function (obj) {
			var self = this;

			self.supersessionSearch.open(obj);
		},

		getCrumbsData: function () {
			var self = this,
				$items = self.$crumbs.find('a[data-type]'),
				params = {},
				type, value;

			$items.each(function (i, e) {
				type = $(e).attr('data-type') + 'Code';
				value = $(e).attr('data-code');
				params[type] = value;
			});

			return params;
		},

		setCartCount: function (count) {
			var self = this;

			count === 0 ? self.$cartCount.hide() : self.$cartCount.show().find('.num').text(count);
		},

		loadNoticeCount: function () {
			var self = this;

			ajax.invoke({
				url: '/epc/notice/getCount',
				type: 'GET',
				cache: false,
				success: function (root) {
					var count = root.data;
					count === 0 ? self.$noticeCount.hide() : self.$noticeCount.show().find('.num').text(count);
				}
			});
		},

		loadQuestionnaireCount: function () {
			var self = this;

			ajax.invoke({
				url: '/common/getQusetionnaireCount',
				type: 'GET',
				cache: false,
				success: function (root) {
					var count = root.data;
					count === 0 ? self.$questionnaireCount.hide() : self.$questionnaireCount.show().find('.num').text(count);
					self.questionnaireCount = count;
				}
			});
		},

		afterSearchClick: function($this) {
			var self = this,
				code = $this.attr('data-code'),
				count = --self.questionnaireCount;

			count === 0 ? self.$questionnaireCount.hide() : self.$questionnaireCount.find('.num').text(count);
			self.$questionnaireCount.find('.num').text(count);
			$this.replaceWith('<a href="/pac/survey/detail/'+ code +'" target="_blank" class="text-link a-link"><span class="search-text">查看回复</span></a>');
		},

		addToCart: function (params) {		//params => {partNo: 'partNo'}
			var self = this;

			self.miniCart.addGoods(params);
		},

		loadLang: function () {
			var self = this;

			ajax.invoke({
				url: '/common/getLangData',
				type: 'GET',
				cache: true,
				success: function (root) {
					self.renderLang(self.buildLang(root));
				}
			});
		},

		buildLang: function (data) {
			var self = this,
				data = data || [],
				lang = globalConfig.context.lang || '';

			for(var i = 0; i < data.length; i++) {
				if(data[i].code == lang) {
					data[i].checked = true;
				} else {
					data[i].checked = false;
				}
			}

			return data;
		},

		renderLang: function (data) {
			var self = this,
				template = '{{#list}}<li data-action="{{code}}" {{#checked}}class="checked"{{/checked}}><a href="javascript:;">{{name}}</a></li>{{/list}}',
				output = Mustache.render(template, {list: data});

			self.$langList.html(output);
		},

		changeLang: function (lang) {
			var self = this;

			ajax.invoke({
				url: '/common/changeLang?lang=' + lang,
				type: 'GET',
				cache: false,
				success: function (root) {
					location.href = location.href;
				}
			});
		},

		isNeed: function(id) {
			var self = this;

			return $('#' + id).length;
		},

		initHeaderSearchVal: function () {
			var self = this,
				from = $.getParameterByName('from'),
				vinNo = $.getParameterByName('vinNo'),
				vehicleCode = $.getParameterByName('vehicleCode'),
				params = {};

			if(from == 'vin') {
				params['type'] = 'vin';
				params['value'] = vinNo;
			} else if(from == 'vehicle') {
				params['type'] = 'vehicle-code';
				params['value'] = vehicleCode;
			} else {
				return;
			}

			self.headerSearch.checkSearchType(params);
			self.headerSearch.setSearchVal(params.value);
		},

		initOpenModifyPasswrod: function () {
			var self = this;

			if(pageConfig.needChangePassword) {
				self.modifyPassword.mustMoidfyPassword();
			}
		}
		
	};

	return Header;

});