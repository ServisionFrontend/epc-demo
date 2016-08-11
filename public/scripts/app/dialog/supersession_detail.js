define(['ajax', 'mustache','jquery', 'jqExtend', 'showLoading'], function (ajax, Mustache) {

	var SupersessionDetail = function () {
		this.init();
	};

	SupersessionDetail.prototype = {

		init: function () {
			var self = this;

			self.bindEls();
			self.bindAttr();			
		},

		bindEls: function () {
			var self = this;

			self.$dialog = $('#supersession-detail-dialog');
			self.$contWrap = $('#supersession-detail-dialog-cont');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$dialog.find('script').html();
		},

		load: function (callback) {
			var self = this;

			//self.$dialog.showLoading();
			ajax.invoke({
				url: '/epc/supersession/getSupersessionDetail?code=' + self.code,
				complete: function () {
					//self.$dialog.hideLoading();
				},
				success: function (root) {
					self.render(self.buildData(root));
					callback();
				}
			});
		},

		buildData: function (data) {
			var self = this,
				olds = data.olds,
				news = data.news;

			for(var i = 0; i < olds.length; i++) {
				olds[i].rowNumber = i+1;
			}
			for(var i = 0; i < news.length; i++) {
				news[i].rowNumber = i+1;
			}

			return data;
 		},

		render: function (data) {
			var self = this,
				output = Mustache.render(self.template, {record: data});

			self.$contWrap.html(output);
		},

		open: function (params, parentObj) {
			var self = this;

			self.code = params.code;
			// self.$dialog.find('[data-id=supersession-number]').text(params.code);
			self.load(function () {
				self.showDialog(parentObj);
			});
		},

		showDialog: function (parentObj) {
			var self = this,
				config;

			if(!parentObj) {
				config = {
					message: self.$dialog,
					name: 'supersession-detail'
				};
			} else {
				config = {
					parent: parentObj,
					message: self.$dialog,
					name: 'supersession-detail'
				}
			}
			$.showBlockUI(config);
		}

	};

	return SupersessionDetail;

});