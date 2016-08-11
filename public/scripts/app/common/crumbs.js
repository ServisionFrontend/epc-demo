define(['ajax' ,'mustache', 'jquery', 'jqExtend'], function (ajax, Mustache) {
	
	var CRUMBS_CONFIG = [
		{
			type: 'brand',
			label:'品牌',
			isShow: true,
			url: '/epc/catalog',
			click: true
		},
		{
			type: 'series',
			label:'车系',
			isShow: true,
			url: '/epc/catalog',
			click: true
		},
		{
			type: 'modelGroup',
			label:'车型组',
			isShow: true,
			url: '/epc/model',
			click: true
		},
		{
			type: 'model',
			label:'整编车型',
			isShow: true,
			url: '/epc/model',
			click: true
		},
		{
			type: 'image',
			label: '图例',
			isShow: false,
			url: '/epc/model',
			click: true
		}
	];

	var defaultOpts = {
		firstRenderCrumbs: true,
		isFilterData: true,
		callbacks: {
			onRenderFinished: null,
			onFristRenderCrumbs: null,
			onRenderBefore: null
		}
	};

	var Crumbs = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	Crumbs.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();
			self.bindEvent();
			self.initCrumbsParams();
			if(self.opts.firstRenderCrumbs) {
				self.render();
				if(typeof self.opts.callbacks.onFristRenderCrumbs === 'function') {
					self.opts.callbacks.onFristRenderCrumbs.apply(self, [self.getCrumbsCode()]);
				}
			}
		},

		bindEls: function () {
			var self = this;

			self.$crumbs = $('#crumbs');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$crumbs.find('script').html();
		},

		bindEvent: function () {
			var self = this;

			self.$crumbs.on('click', 'a[data-type][data-click=true]', function () {
				window.location.href = $(this).attr('data-url');
			});
		},

		initCrumbsParams: function () {
			var self = this,
				config = CRUMBS_CONFIG,
				data = [],
				type, code;

			for(var i = 0; i < config.length; i++) {
				type = config[i].type;
				code = $.getParameterByName(type + 'Code');
				if(code.length > 0) {
					data.push({
						'type': type,
						'code': code
					})
				}
			}

			if(typeof self.opts.callbacks.onInitCrumbsParamsAfter === 'function') {
				self.opts.callbacks.onInitCrumbsParamsAfter.apply(this, [data, config]);
			}
			
			self.data = data;
		},

		buildData: function () {
			var self = this,
				data = self.data;
			
			return self.buildUrl(data);
		},

		removeSingle: function (type) {
			var self = this,
				data = self.data;

			for(var i = 0; i < data.length; i++) {
				if(data[i].type === type) {
					data.splice(i, 1);
					break;
				}
			}
		},

		replaceSingle: function (params) {
			var self = this,
				data = self.data,
				type = params.type, 
				code = params.code, 
				label = params.label,
				hasType = false,
				index;

			for(var i = 0 ; i < data.length; i++) {
				if(data[i].type == type) {
					data[i].code = code;
					hasType = true;
					index = i;
					break;
				}
			}

			if(!hasType) {
				data.push({
					'type': type,
					'code': code
				})
			}
		},

		loadCrumbsInfo: function (params, callbacks) {
			var self = this;

			ajax.invoke({
				type: 'GET',
				url: '/epc/crumbs',
				data: params,
				contentType: 'application/json',
				success: function (result) {
					callbacks.apply(null, [result]);
				}
			});
		},

		render: function () {
			var self = this,
				codeParams = self.getCrumbsCode(),
				finalData;

			self.loadCrumbsInfo(codeParams, function (result) {

				finalData = self.buildFinalData(result);

				if(typeof self.opts.callbacks.onRenderBefore === 'function') {
					self.opts.callbacks.onRenderBefore.apply(self, [finalData, CRUMBS_CONFIG]);
				}
				output = Mustache.render(self.template, {records: finalData});
				self.$crumbs.html(output);
			});
		},

		buildFinalData: function (result) {
			var self = this,
				config = CRUMBS_CONFIG,
				data = [], type, code;

			for(var i = 0; i < config.length; i++) {
				type = config[i].type;
				code = result[config[i].type + 'Code'];
				if(code && code.length > 0) {					
					data.push({
						type: config[i].type,
						code: result[config[i].type + 'Code'],
						label: config[i].label,
						url: self.getUrl(type, code),
						isShow: config[i].isShow,
						text: result[config[i].type + 'Name'],
						click: config[i].click
					})
				}
			}

			self.data = data;
			return data;
		},

		getUrl: function (type, code) {
			var self = this,
				params = self.getCrumbsCode(),
				config = CRUMBS_CONFIG;
				path = '';

			for(var i = 0; i < config.length; i++) {
				if(type == config[i].type) {
					path = config[i].url;
					break;
				}
			}

			switch (type) {
				case 'brand':
					url = path + '?brandCode=' + (code || '');
					break;
				case 'series':
					url = path + '?brandCode=' + (params['brandCode'] || '') + "&seriesCode=" + (code || '');
					break;
				case 'modelGroup':
					url = path + '?brandCode=' + (params['brandCode'] || '') + "&seriesCode=" + (params['seriesCode'] || '') + '&modelGroupCode=' + (code || '')
					break;
				case 'model':
					url = path + '?brandCode=' + (params['brandCode'] || '') + "&seriesCode=" + (params['seriesCode'] || '') + '&modelGroupCode=' + (params['modelGroupCode'] || '') + '&modelCode=' + (code || '');
					break;
				default:
					url = 'javascript:;';
					break;
			}

			return url;
		},

		getCrumbsCode: function (data) {
			var self = this,
				data = data ? data : self.data,
				params = {};

			for(var i = 0; i < data.length; i++) {
				params[data[i].type + 'Code'] = data[i].code;
			}

			return params;
		}

	};

	return Crumbs;

});