(function($) {
	function setup(ajax, Mustache) {
		var carCatalogSelect = {
			init: function(target) {
				var self = this;

				self.$target = $(target);
				self.opts = $.data(target, 'carCatalogSelect').options;
				self.initEls();

				self.initBrandSelect();
				self.initEvents();
			},

			initEls: function() {
				var self = this;

				self.brandSelect = self.$target.find('[data-sign="brand"]');
				self.seriesSelect = self.$target.find('[data-sign="series"]');
				if(self.opts.needGroups) {
					self.mainGroupSelect = self.$target.find('[data-sign="main-group"]');
					self.childGroupSelect = self.$target.find('[data-sign="child-group"]');
				}
				
			},

			initAttrs: function() {
				var self = this;

				self.brandData = [];
				self.groupData = []
			},

			initTemplate: function() {
				var self = this;

				self.$brandTempl = self.brandSelect.find('#brand-template');
			},

			initBrandSelect: function() {
				var self = this;

				self.getBrand();
			},

			getBrand: function() {
				var self = this;

				ajax.invoke({
					url: '/pac/online/brand',
					type: 'GET',
					success: function (data) {
						self.brandData = data;
						self.renderTemplate(data, self.brandSelect);
					}
			 	});
			},

			renderTemplate: function(data, $dom) {
				var self = this;
				var html,
					template = $('#select-template').html(),
					templateWrapper = $dom.find('.form-select-option-list');

				html = Mustache.render(template, {list: data});
				templateWrapper.html(html);
				if(data.length > 0) {
					$dom.removeClass('disabled');
				} else {
					$dom.addClass('disabled');
				}
			},

			initEvents: function() {
				var self = this;

				self.brandSelect.on('evtChange', function() {
					self.resetSelect(1);
					self.getSeries($(this));
					
				});
				self.seriesSelect.on('evtChange', function() {
					if(self.opts.needGroups) {
						self.resetSelect(2);
						self.getGroups($(this));
					}					
				});
				if(self.opts.needGroups) {
					self.mainGroupSelect.on('evtChange', function() {
						self.resetSelect(3);
						self.getChildGroup($(this));
					});
				}
				
			},

			getSeries: function($this) {
				var self = this;

				var val = $this.find('.form-select-input').val(),
					params = {parentCode: val};

				ajax.invoke({
					url: '/pac/online/series',
					type: 'GET',
					data: params,
					dataType: 'json',
					success: function (data) {
						self.renderTemplate(data, self.seriesSelect);
					}
			 	});
			},

			getGroups: function($this) {
				var self = this;

				var val = $this.find('.form-select-input').val(),
					params = {code: val};

				ajax.invoke({
					url: '/pac/online/brandGroups',
					type: 'GET',
					data: params,
					success: function (data) {
						self.groupData = data;
						self.renderTemplate(data, self.mainGroupSelect);
					}
			 	});
			},

			getChildGroup: function($this) {
				var self = this;

				var val = $this.find('.form-select-input').val(),
					data = self.groupData;

				for(var i=0; i<data.length; i++) {
					if(data[i].code === val) {
						self.renderTemplate(data[i].subGroup, self.childGroupSelect);
					}
				}
			},

			resetSelect: function(index) {
				var self = this;
				
				var array = [self.brandSelect ,self.seriesSelect,self.mainGroupSelect,self.childGroupSelect];
				if(!self.opts.needGroups) {
					array = [self.brandSelect ,self.seriesSelect];
				}
				
				for(var i = index; i < array.length; i++) {
					array[i].find('.form-select-option-list').empty();
					array[i].find('.form-select-input').val('');
					array[i].find('.form-select-text').text('请选择');
				}
			}
		};

		$.fn.carCatalogSelect = function(options, params) {
			var jqEls = this;

			if(options === 'string') {
				return $.fn.carCatalogSelect.methods[options](jqEls, params);
			}

			return jqEls.each(function() {
				$.data(this, 'carCatalogSelect', {
					options: $.extend({}, $.fn.carCatalogSelect.defaults, options || {})
				});

				this.carCatalogSelect = $.extend({}, carCatalogSelect, {});
				this.carCatalogSelect.init(this);
			})
		};

		$.fn.carCatalogSelect.methods = {
			
		};

		$.fn.carCatalogSelect.defaults = {
			needGroups: true
		};
	};
	if(typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['ajax','mustache'], setup)
	} else if(typeof exports === 'object') {
		module.exports = setup;
	} else {
		setup();
	}


})(jQuery);