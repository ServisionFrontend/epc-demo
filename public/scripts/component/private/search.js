/*!
 * search component
 * version 1.0-2015.1.5
 * @requires
 */
;
(function($) {

	function setup(ajax, mustache) {

		var Search = function(options) {
			this.opts = $.extend(true, {}, defaultOpts, options || {});

			this.init();
		}

		Search.prototype = {

			init: function() {
				var self = this;

				self.buildEl();
				self.buildAttr();
				self.initEvents();
			},

			buildEl: function() {
				var self = this;

				self.$searchWrap = $('#' + self.opts.searchWrapId);

				self.$items = self.$searchWrap.find('[data-name]');
				self.$reset = self.$searchWrap.find('[data-id=reset]');
				self.$query = self.$searchWrap.find('[data-id=search]');
				self.$selectItems = self.$searchWrap.find('select[data-name]');
				self.$formSelectItems = self.$searchWrap.find('[data-special-select]');
			},

			buildAttr: function () {
				var self = this,
					opts = self.opts;

				self.selectInputCls = opts.formSelectInputCls;
				self.selectTextCls = opts.formSelectTextCls;
				self.selectOptionCls = opts.formSelectOptionCls;
				self.selectListCls = opts.formSelectListCls;
				self.checkedOptionCls = opts.currentOption;
			},

			initEvents: function() {
				var self = this;

				// 重置查询条件
				self.$reset.on('click', function() {
					self.reset();
				});

				// 点击查询按钮
				self.$query.on('click', function() {
					self.query();
				});

				// 文本框内回车查询
				self.$items.on('keyup', function(e) {
					if (e.keyCode === 13) {
						self.query();
					}
				});

				// 下拉框选择改变
				self.$selectItems.on('change', function() {
					var $target = $(this);

					self.changeSelectOption($target);
					self.buildNextSelectOption($target);
				});

				self.$formSelectItems.on('evtChange', function () {
					var $target = $(this);

					self.changeSelectOption($target.find('.' + self.selectInputCls));
					self.buildNextSelectOption($target.find('.' + self.selectInputCls));
				})
			},

			changeSelectOption: function($el) {
				var self = this,
					i = 0,
					$item,
					name = $el.attr('data-name'),
					clearTargets = self.getClearTargets(name);

				for (; i < clearTargets.length; i++) {
					$item = self.getItem(clearTargets[i]);

					self.clearOption($item);
				}
			},

			buildNextSelectOption: function($el) {
				var self = this,
					i = 0,
					name = $el.attr('data-name'),
					nextTargets = self.getNextTargets(name);

				for (; i < self.asynFuns.length; i++) {
					var funName = self.asynFuns[i].name;

					if ($.inArray(funName, nextTargets) > -1) {
						self.asynFuns[i].fun();
					}
				}
			},

			getNextTargets: function(name) {
				var self = this,
					i = 0,
					selectFields = self.opts.selectFields;

				for (; i < selectFields.length; i++) {
					if (selectFields[i].name === name) {
						return selectFields[i].nextTargets;
					}
				}
			},

			clearOption: function($item) {
				var self = this;

				if ($item.get(0).tagName.toUpperCase() == 'SELECT') {
					$item.find('option').remove().end();
					$item.html('<option value="">' + self.opts.selectAllText + '</option>');
				}
				if($item.attr('data-type') && $item.attr('data-type').toUpperCase() == 'SELECT') {
					var $select = $item.parent();
					$item.val('');
					$select.find('.' + self.selectTextCls).text('请选择');
					$select.find('.' + self.selectListCls).html('');
				}
			},

			getClearTargets: function(name) {
				var self = this,
					i = 0,
					selectFields = self.opts.selectFields;

				for (; i < selectFields.length; i++) {
					if (name === selectFields[i].name) {
						return selectFields[i].clearTargets || [];
					}
				}

				return [];
			},

			getItem: function(name) {
				var self = this,
					$item = self.$searchWrap.find('[data-name=' + name + ']');

				return $item;
			},

			reset: function() {
				var self = this;

				self.$items.each(function(index, el) {
					var $el = $(el);

					if($el.attr('data-notReset')) return;
					
					self.clearVal($el);

					if (!$el.attr('data-notClearOption')) {
						self.clearOption($el);
					}
				});

				if(typeof self.opts.callbacks.onReset === 'function') {
					self.opts.callbacks.onReset.apply(null, []);
				}
			},

			on: function(evtName, evtFun) {
				var self = this;

				if (evtName === 'onQuery') {
					self.opts.callbacks.onQuery = evtFun;
				}
				if (evtName === 'onReset') {
					self.opts.callbacks.onReset = evtFun;
				}
			},

			setFieldsVal: function(values) {
				var self = this,
					name, type;

				self.reset();
				self.defaultVal = values;
				self.$items.each(function(index, el) {
					name = $(el).attr('data-name');
					if (values[name]) {
						$(el).val(values[name]);
					}
					
				});

				self.loadDropDownData();
			},

			loadDropDownData: function() {
				var self = this,
					i = 0,
					j = 0,
					asynFuns = [],
					selectFields = self.opts.selectFields;

				for (; i < selectFields.length; i++) {
					var name = selectFields[i].name,
						depend = selectFields[i].depend,
						root = selectFields[i].root;

					// 闭包保留作用域的变量信息
					var fun = (function(name, depend, root) {
						return function(cb) {
							var params = self.getDropDownParams(name, depend);

							if (params) {
								ajax.invoke({
									url: params.url,
									success: function(result) {
										if(params.$el.attr('data-type') == 'select') {
											self.renderFromSelectOption(params.$el, result, root, name, cb);
										} else {
											self.renderSelectOption(params.$el, result, root, name, cb);
										}
									}
								});
							} else {
								if (typeof self.opts.callbacks.onSelectRenderFinish === 'function') {
									self.opts.callbacks.onSelectRenderFinish.apply(null);
								}
							}
						}
					})(name, depend, root);

					asynFuns.push({
						name: name,
						fun: fun
					});
				}

				self.asynFuns = asynFuns;

				if (asynFuns.length > 0) {
					self.asynFuncCall(0, asynFuns)
				}
			},

			asynFuncCall: function(idx, asynFuns) {
				var self = this;

				asynFuns[idx].fun(function() {
					idx++;
					if (idx < asynFuns.length) {
						self.asynFuncCall(idx, asynFuns);
					} else {
						if (typeof self.opts.callbacks.onSelectRenderFinish === 'function') {
							self.opts.callbacks.onSelectRenderFinish.apply(null);
						}
					}
				});
			},

			renderSelectOption: function($el, result, resultRoot, name, callback) {
				var self = this,
					tpl = '<option value="">' + self.opts.selectAllText + '</option>' +
					'{{#list}}<option value="{{code}}">{{name}}</option>{{/list}}',
					html = mustache.render(tpl, {
						list: result[resultRoot]
					});

				$el.html(html);

				if(self.defaultVal) {
					self.setVal($el, self.defaultVal[name] || '');
					self.defaultVal[name] = null;
				}

				if (typeof callback === 'function') {
					callback.apply();
				}
			},

			renderFromSelectOption: function($el, result, resultRoot, name, callback) {
				var self = this,
					$select = $el.parent('.form-select');
					tpl = '<li class="' + self.selectOptionCls + ' ' + self.checkedOptionCls + '">请选择</li>{{#list}}<li data-value="{{code}}" title="{{name}}" class="' + self.selectOptionCls + '">{{name}}</li>{{/list}}',
					html = mustache.render(tpl, {
						list: result[resultRoot]
					});

				$select.find('.' + self.selectListCls).html(html);

				if(self.defaultVal) {
					self.setVal($el, self.defaultVal[name] || '');
					self.defaultVal[name] = null;
				}

				if (typeof callback === 'function') {
					callback.apply();
				}
			},

			getDropDownParams: function(name, depends) {
				var self = this,
					urlParams = self.buildUrlParams(depends),
					$el = self.$searchWrap.find('[data-name=' + name + ']'),
					url = $el.attr('data-url'),
					item = self.getSelectFieldItem(name);

				return urlParams.length || item.noParams ? {
					$el: $el,
					url: url + urlParams
				} : null;
			},

			getSelectFieldItem: function(name) {
				var self = this,
					i = 0,
					selectFields = self.opts.selectFields;

				for (; i < selectFields.length > 0; i++) {
					if (selectFields[i].name === name)
						return selectFields[i];
				}

				return null;
			},

			buildUrlParams: function(depends) {
				var self = this,
					i = 0,
					field, $el, val,
					params = [],
					depends = depends || [];

				for (; i < depends.length; i++) {
					field = depends[i];
					$el = self.$searchWrap.find('[data-name=' + field + ']');
					val = self.getVal($el);
					params.push(val);
				}

				return params.join('/');
			},

			query: function() {
				var self = this,
					params = self.getParams();

				if (typeof self.opts.callbacks.beforeQuery === 'function') {
					if (!self.opts.callbacks.beforeQuery.apply(this, [params])){
						return;
					}
				}

				if (typeof self.opts.callbacks.onQuery === 'function') {
					self.opts.callbacks.onQuery.apply(null, [params]);
				}
			},

			clearVal: function(el) {
				var self = this,
					tagType,
					tagName = el.prop("tagName").toUpperCase(),
					$select;

				if (tagName === "SELECT") {
					el.get(0).selectedIndex = 0;
				}
				if (tagName === "SPAN" || tagName === "LABEL") {
					el.text("");
				}
				if (tagName === "INPUT") {					
					tagType = el.attr("type").toUpperCase();
					if (tagType === "TEXT" || tagType === "HIDDEN") {
						el.val("");
					}
					if (tagType === "CHECKBOX" || tagType === "RADIO") {
						el.attr("checked", false);
					}
					if(el.attr('data-type') && el.attr('data-type').toUpperCase() == 'SELECT') {
						$select = el.parent('.form-select');
						$select.find('.' + self.selectTextCls).text('请选择');
						$select.find('.' + self.checkedOptionCls).removeClass(self.checkedOptionCls);
					}
				}
			},

			getVal: function(el) {
				var tagType,
					tagName = el.prop("tagName").toUpperCase();

				if (tagName === "SELECT") {
					return el.val();
				}
				if (tagName === "SPAN" || tagName === "LABEL") {
					return el.text();
				}
				if (tagName === "INPUT") {
					tagType = el.attr("type").toUpperCase();
					if (tagType === "TEXT" || tagType === "HIDDEN") {
						return el.val();
					}
					if (tagType === "CHECKBOX" || tagType === "RADIO") {
						return el.prop("checked");
					}
				}
			},

			setVal: function(el, value) {
				var self = this,
					tagType,
					tagName = el.prop("tagName").toUpperCase(),
					$select;

				if(value.length == 0) return;

				if (tagName === "SELECT") {
					el.val(value);
				}
				if (tagName === "SPAN" || tagName === "LABEL") {
					el.text(value);
				}
				if (tagName === "INPUT") {
					tagType = el.attr("type").toUpperCase();
					if (tagType === "TEXT" || tagType === "HIDDEN") {
						el.val(value);
					}
					if (tagType === "CHECKBOX" && $.inArray(parseInt(el.val()), value) > -1) {
						el.attr("checked", true);
					}
					if(el.attr('data-type') && el.attr('data-type').toUpperCase() == 'SELECT') {
						$select = el.parent('.form-select');
						$option = $select.find('[data-value="'+value+'"]');
						$select.find('.' + self.selectTextCls).text($option.text());						
						if($option) $option.addClass(self.checkedOptionCls).siblings().removeClass(self.checkedOptionCls);
					}
				}
			},

			getParams: function() {
				var self = this,
					params = {};

				self.$items.each(function(index, el) {
					var name = $(el).attr('data-name'),
						val = self.getVal($(el));

					if ($.trim(val).length > 0)
						params[name] = val;
				});

				if(typeof self.opts.callbacks.onGetParamsAfter === 'function') {
					self.opts.callbacks.onGetParamsAfter.apply(self, [params]);
				}

				return params;
			}
		};

		var defaultOpts = {
			selectFields: [],
			selectAllText: '请选择...',
			formSelectCls: 'form-select',
			formSelectTextCls: 'form-select-text',
			formSelectInputCls: 'form-select-input',
			formSelectOptionCls: 'form-select-option',
			formSelectListCls: 'form-select-option-list',
			currentOption: 'currentOption',
			callbacks: {
				onGetParamsAfter: null,
				onQuery: null,
				onReset: null,
				onSelectRenderFinish: null
			}
		};

		return Search;
	}

	define(['ajax', 'mustache'], setup);

})(jQuery);