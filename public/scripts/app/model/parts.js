define(['ajax', 'mustache', 'note', 'jquery', 'scrollIntoView', 'showLoading', 'jqExtend'], function (ajax, Mustache, Note) {
	
	var defaultOpts = {
		callbacks: {
			onClickedRow: null,
			onClickedOperation: null
		}
	};

	var Parts = function (options) {
		this.opts = $.extend({}, defaultOpts, options || {});
		this.init();
	};

	Parts.prototype = {

		init: function () {
			var self = this;

			self.initComponent();
			self.bindEls();
			self.bindAttr();
			self.bindEvent();			
		},

		initComponent: function () {
			var self = this;

			self.note = new Note();
		},

		bindEls: function () {
			var self = this;

			self.$parts = $('#parts');
			self.$partsBody = $('#parts-body');
			self.$price = $('#parts-price');
		},

		bindAttr: function () {
			var self = this;

			self.template = self.$partsBody.find('script').html();
        	self.timer1 = null;
        	self.timer2 = null;
        	self.clipboard = null;
		},

		bindEvent: function () {
			var self = this;

			self.$partsBody.on("click", "[data-field]", function (e) {
                self.clickedRow(this, e);
            });

            self.$partsBody.on("click", "[data-action]", function (e) {
                self.clickedOperation($(this), e);
            });

            self.$partsBody.on('mouseenter', '[data-action=price]', function (e) {
            	self.enterPrice(e);
            }).on('mouseleave', '[data-action=price]', function (e) {
            	self.leavePrice(e);
            });

            $(window).resize(function () {
            	self.caculatePartsBody();
            });
		},

		clickedRow: function (sender, e) {
			var self = this,
				$row = $(sender),
				callout = $row.attr('data-callout');

			self.linkParts([callout]);
			if(typeof self.opts.callbacks.onClickedRow === 'function') {
				self.opts.callbacks.onClickedRow.apply(null, [[callout]]);
			}
			e.stopPropagation();
		},

		clickedOperation: function ($target, e) {
			var self = this,
				action = $target.attr('data-action'),
				partNo;

			switch (action) {
				case 'copy':
					if (window.clipboardData) { 
						partNo = $target.closest('[data-field=row]').attr('data-partNo') || '';
            			window.clipboardData.setData('Text', partNo);
            		} else {
            			$target.prev().select();
            			try {
            				document.execCommand('Copy');
            			} catch(err) {}
            		}
					break;
				case 'more':
					break;
				default:
					break;
			}

			if(typeof self.opts.callbacks.onClickedOperation === 'function') {
				self.opts.callbacks.onClickedOperation.apply(self, [$target, action]);
			}
		},

		load: function (params) {
			var self = this,
				params = self.buildParams(params);

			self.$parts.showLoading();
			ajax.invoke({
				url: '/epc/model/getParts',
				type: 'GET',
				data: params,
				cache: false,
				complete: function () {
					self.$parts.hideLoading();
				},
				success: function (root) {
					self.render(self.validateData(root));
				}
			});
		},

		buildParams: function (params) {
			var self = this;
			var from = $.getParameterByName('from');
			var vinNo = $.getParameterByName('vinNo');
			var vehicleCode = $.getParameterByName('vehicleCode');

			if(from) {params['from'] = from;}
			if(vinNo) {params['vinNo'] = vinNo;}
			if(vehicleCode) {params['vehicleCode'] = vehicleCode;}

			return params;
		},

		validateData: function (data) {
			var self = this;

			try {
				if (window.clipboardData || document.execCommand('Copy')) {
					return data;
				} else {
					return self.buildData(data);
				}
			} catch(err) {
				return self.buildData(data);
			}
		},

		buildData: function (data) {
			var self = this;

			for(var i = 0; i < data.length; i++) {
				data[i].copyTitle = '点击后请立即按 Ctrl+C';
			}

			return data;
		},

		render: function (data) {
			var self = this,
				output = Mustache.render(self.template, {records: data});

			self.$partsBody.html(output);
			self.caculatePartsBody();
		},

		linkParts: function (callouts) {
	        var self = this,
	            selector = self.getCalloutSelector(callouts),
	            $rows = self.$partsBody.find(selector);

	        if (self.oldRow) {
	            self.oldRow.removeClass("checked");
	        }
	        self.oldRow = $rows.addClass("checked");
	        $rows.size() && self.scrollIntoView($rows);
	    },

	    highlightPartRows: function (partNumber) {
            var self = this,
                $rows = self.$partList.find("tr[data-partnumber='" + partNumber + "']");

            if (self.oldRow) {
                self.oldRow.removeClass("checkedTr");
            }
            self.oldRow = $rows.addClass("checkedTr");
            $rows.size() && self.scrollIntoView($rows);
        },

	    getCalloutSelector: function (callouts) {
            var self = this, selector = [];

            for (var i = 0; i < callouts.length; i++) {
                selector.push("div[data-callout='" + callouts[i] + "']");
            }

            return selector.join(",");
        },

        scrollIntoView: function ($rows) {
            var me = this;

            $rows.scrollIntoView();
        },

        enterPrice: function (e) {
        	var self = this,
        		$target = $(e.target);

        	clearTimeout(self.timer2);
        	self.timer1 = setTimeout(function () {
        		self.$price.show()
        			.css({
        				'left': $target.offset().left + 25,
        				'top': $target.offset().top - 5
        			})
        			.find('.text').text($target.attr('data-price'));
        	}, 500);
        },

        leavePrice: function (e) {
        	var self = this;

        	clearTimeout(self.timer1);
        	self.timer2 = setTimeout(function () {
        		self.$price.hide();
        	}, 500);
        },

        caculatePartsBody: function () {
        	var self = this,
        		partsBodyHeight = self.$partsBody.height(),
        		$trs = self.$partsBody.children(),
        		height = $trs.eq(0).height() || 0,
        		trsHeight = $trs.length * height,
        		$partNames = self.$parts.find('.part-name');

        	$partNames.removeClass('change-width');
        	
        	if(partsBodyHeight < trsHeight) {
	        	$partNames.addClass('change-width');
        	}
        }

	};

	return Parts;

});