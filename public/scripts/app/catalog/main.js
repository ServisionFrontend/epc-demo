require(['ajax', 'mustache', 'crumbs', 'header', 'jquery', 'showLoading', 'pjaxInterceptor', 'ejs'],
	function(ajax, Mustache, Crumbs, Header) {

		var catalog = {
			init: function() {
				var self = this;

				self.initEl();
				self.initEvents();
			},

			initEl: function() {
				var self = this;

				self.$brandTab = $('#brand-tab');
				self.$modelBody = $('#model-body');
				self.$seriesWrap = $('#series-wrap');
				self.$crumbsWrap = $('#crumbs-wrap');
			},

			initEvents: function() {
				var self = this;

				if ($.support.pjax) {

					self.$brandTab.on('click', 'a[data-pjax]', function(event) {
						var $target = $(this);

						self.selectionBrand($target);
						event.preventDefault();
					});

					self.$seriesWrap.on('click', 'a[data-pjax]', function(event) {
						var $target = $(this);

						self.selectionSeries($target);
						event.preventDefault();
					});

					self.$seriesWrap.on('pjax:beforeReplace', function(event, container) {
						var result = JSON.parse(container[0].data);

						self.replaceSeriesRender(container, result);
						self.renderModel(result);
						self.renderCrumbs(result);
					});

					self.$modelBody.on('pjax:beforeReplace', function(event, container) {
						var result = JSON.parse(container[0].data);

						self.replaceModelRender(container, result);
						self.renderCrumbs(result);
					});
				}

				self.$modelBody.on('click', '[data-action=toggle]', function() {
					self.toggleModel($(this));
				});
			},

			selectionBrand: function($target) {
				var self = this;
				var url = $target.attr('href');

				self.$brandTab.find('li').removeClass('checked');
				$target.parent().addClass('checked');

				$.pjax({
					url: url + '&_dc=' + (new Date()).getTime(),
					container: '#series-wrap'
				});
			},

			selectionSeries: function($target) {
				var self = this;
				var url = $target.attr('href');
				self.$seriesWrap.find('li').removeClass('checked');

				$target.parents('li').addClass('checked');

				$.pjax({
					url: url + '&_dc=' + (new Date()).getTime(),
					container: '#model-body'
				});
			},

			replaceSeriesRender: function(container, result) {
				var self = this;
				var html = new EJS({
					url: '/catalog/series-tpl.ejs'
				}).render(result);

				container[0] = $('<div>' + html + '</div>')[0];
			},

			renderModel: function(result) {
				var self = this;
				var html = new EJS({
					url: '/catalog/model-tpl.ejs'
				}).render(result);

				self.$modelBody.html(html);
			},

			replaceModelRender: function(container, result) {
				var self = this;
				var html = new EJS({
					url: '/catalog/model-tpl.ejs'
				}).render(result);

				container[0] = $('<div>' + html + '</div>')[0];
			},

			renderCrumbs: function(result) {
				var self = this;
				var html = new EJS({
					url: '/common/crumbs.ejs'
				}).render(result);

				self.$crumbsWrap.html(html);
			},

			toggleModel: function($target) {
				var self = this,
					$type = $target.closest('li');

				if ($type.find('ul:first').is(':visible')) {
					$type.removeClass('checked');
				} else {
					$type.addClass('checked');
				}
			}
		};

		catalog.init();
	});