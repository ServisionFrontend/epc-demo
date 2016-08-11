define(['dialog', 'ajax', 'mustache', 'jquery', 'jqExtend'], function (Dialog, ajax, Mustache) {

	var defaultOpts = {
		callbacks: {
			onSearch: null
		}
	};

	var HeaderSearch = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	HeaderSearch.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();
			self.bindEvent();
		},

		bindEls: function () {
			var self = this;

			self.$searchSelect = $('#header-search-select');
			self.$searchBox = $('#header-search-box');
			self.$searchBtn = $('#header-search-btn');
			self.$searchClose = $('#header-search-close');
			self.$autocomplete = $('#header-autocomplete');
			self.$autocompleteList = $('#header-autocomplete-list');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$autocompleteList.find('script').html();
			self.index = 0;
		},

		bindEvent: function () {
			var self = this;

			self.$searchBox.on('keyup', function (e) {
				if(e.keyCode === 13) {
					self.$searchBtn.trigger('click');
				} else {
					if(self.$searchSelect.find('input').val() === 'vin') {
						self.changeInputVal(self);
					}
				}
			});

			self.$searchClose.click(function () {
				self.$searchBox.val('');
				self.changeInputVal();
			});

			self.$autocompleteList.on('click', 'li', function () {
				self.$searchBox.val($(this).text());
				self.$searchBtn.trigger('click');
				self.clearAutocomplete();
			});

			self.$searchBtn.click(function () {
				self.$searchBox.blur();
				self.clearAutocomplete();
				if(self.validate()) {
					if(typeof self.opts.callbacks.onSearch === 'function') {
						type = self.$searchSelect.selectElByField();
						val = self.$searchBox.val();

						self.opts.callbacks.onSearch.apply(null, [type, val]);
					}
				}
			});

			self.$searchSelect.on('evtChange', function () {
				self.$searchBox.val('');
				self.changeInputVal();
			});
		},

		validate: function () {
			var self = this,
				val = $.trim(self.$searchBox.val());

			if(val.length == 0) {
				new Dialog({
					type: 'error',
					title: '提示',
					content: '请输入查询内容'
				});
				return false;
			}

			return true;
		},

		changeInputVal: function () {
			var self = this,
				$target = self.$searchBox,
				type = self.$searchSelect.selectElByField(),
				val = $.trim($target.val());

			self.$searchClose.removeClass('show');
			self.$searchBox.removeClass('short');

			if(val.length > 0) {
				self.$searchClose.addClass('show');
				self.$searchBox.removeClass('short').addClass('short');
			}

			if(val.length >=6) {
				self.autocomplete(val);
			} else {
				self.clearAutocomplete();
			}
		},

		autocomplete: function (val) {
			var self = this;

			ajax.invoke({
				url: '/epc/vin/vinAutocomplete?vinNo=' + val,
				success: function (root) {
					if(root.list.length > 0) self.render(root);
				}
			});			
		},

		render: function (root) {
			var self = this,
				output = Mustache.render(self.template, {list: root.list});

			self.$autocompleteList.html(output);
			self.$autocomplete.show();
			self.index = 0;
		},

		clearAutocomplete: function () {
			var self = this;

			self.$autocompleteList.html('');
			self.$autocomplete.hide();
		},

		keyUp: function (e) {
			var self = this,
				keyCode = e.keyCode,
				lis = self.$autocompleteList.find('li').length;

			switch (keyCode) {
				case 38:
					self.index == 0 ? self.index =  lis - 1 : self.index = self.index - 1;
					self.checkOption();
					break;
				case 40:
					self.index <= lis ? self.index = self.index + 1 : self.index = 0;
					self.checkOption();
					break;
				case 13:
					break;
				default:
					break;
			}
		},

		checkOption: function () {
			var self = this,
				$target = self.$autocompleteList.find('li').eq(self.index);

			self.$searchBox.val($target.text());
			$target.addClass('currentOption').siblings().removeClass('currentOption');
			self.setScrollView($target);			
		},

		setScrollView: function ($target) {
			var self = this,
				height = $target.outerHeight(),
				parentHeight = self.$autocomplete.height(),
				top = $target.scrollTop();

			if(top + height < parentHeight) {
				self.$autocomplete.scrollTop(top + height);
			}
		},

		checkSearchType: function (params) {
			var self = this;

			self.$searchSelect.find('input').val(params.type);
			self.$searchSelect.find('.form-select-text').text(self.$searchSelect.find('[data-value=' + params.type + ']').text());
		},

		setSearchVal: function (value) {
			var self = this;

			self.$searchBox.val(value);
		}

	};

	return HeaderSearch;

});