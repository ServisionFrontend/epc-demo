define(['grid', 'jquery'], function (Grid) {

	var defaultOpts = {
		callbacks: {
			onClickedSupersessionDetail: null
		}
	};

	var Supersession = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	Supersession.prototype = {

		init: function () {
			var self = this;

			self.initComponent();
		},

		initComponent: function () {
			var self = this;

			self.grid = new Grid({
				gridWrapId: 'supersession-table',
				callbacks: {
					onAfterLoad: function (result) {
						self.buildData(result.list);
					},
					onRowClicked: function (selections, e) {
						var $target = $(e.target);
						if($target.attr('data-action') === 'supersession-detail') {
							self.showSupersessionDetail($target);
						}
					}
				}
			});
			self.grid.load();
		},

		buildData: function (data) {
			var self = this,
				partNo = $.getParameterByName('partNo').toUpperCase();

			for(var i = 0; i < data.length; i++) {
				if(data[i].oldCode.toUpperCase() == partNo) {
					data[i].isOld = true;
					data[i].idNew = false;
				} else if(data[i].newCode.toUpperCase() == partNo) {
					data[i].isOld = false;
					data[i].isNew = true;
				}
			}
		},

		showSupersessionDetail: function ($target) {
			var self = this;

			if(typeof self.opts.callbacks.onClickedSupersessionDetail === 'function') {
				self.opts.callbacks.onClickedSupersessionDetail.apply(this, [{'code': $target.attr('data-code')}]);
			}
		}

	};

	return Supersession;

});