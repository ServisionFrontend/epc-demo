require(['ajax', 'group', 'crumbs', 'header', 'legend', 'parts', 'layout', 'legendList', 'mustache', 'dialog', 'jquery'],
	function (ajax, Group, Crumbs, Header, Legend, Parts, Layout, LegendList, Mustache, Dialog) {
	
	var model = {

		init: function () {
			var self = this;

			self.bindEls();
			self.buildAttrs();
			self.bindEvent();
			self.initComponent();
		},

		bindEls: function () {
			var self = this;

			self.$btnPrint = $('#btn-print');

			self.$printProgressBar = $('#progress-bar');
			self.$printProgressNum = $('#progress-text');
			self.$printProgressSymbol = $('#progress-symbol');
			self.$closeLayerBtn = $('#print-close-btn');
		},

		buildAttrs: function() {
			var self = this;

			self.percentArr = [];
		},

		bindEvent: function () {
			var self = this;

			self.$btnPrint.click(function () {
				self.openPrint();
			});
			
		},

		initComponent: function () {
			var self = this,
				firstShowLegendParts = false,
				imageCode;

			self.crumbs = new Crumbs({
				callbacks: {
					onFristRenderCrumbs: function (params) {
						if(params.imageCode && params.imageCode.length > 0) {
							firstShowLegendParts = true;
							imageCode = params.imageCode;
						}
					},
					onRenderBefore: function (data, config) {
						self.buildCrumbsData(data, config);
					}
				}
			});
			self.header = new Header();
			self.legend = new Legend({
				callbacks: {
					onSelectionCallout: function (callouts) {
						self.parts.linkParts(callouts);
					}
				}
			});
			self.parts = new Parts({
				callbacks: {
					onClickedRow: function (callouts) {
						self.legend.linkLegend(callouts);
					},
					onClickedOperation: function ($target, action) {
						self.clickedPartsRow($target, action);
					}
				}
			});
			self.layout = new Layout();
			self.legendList = new LegendList({
				callbacks: {
					onClickedImage: function ($target, code) {
						self.replaceCrumbs('image', code);
						self.group.clickedLeaf(code);
					}
				}
			});
			self.group = new Group({
				callbacks: {
					onClickedLeaf: function ($target, code) {
						self.replaceCrumbs('image', code);
						self.loadLegendParts($target, code);
						self.$btnPrint.show();
					},
					onClickedGroup: function ($target, code) {
						self.crumbs.removeSingle('image');
						self.loadLegendList(this, $target);
						self.$btnPrint.hide();
					}
				}
			});

			if(firstShowLegendParts) {
				self.group.clickedLeaf(imageCode);
			} else {
				self.group.clickedFirstGroup();
			}
		},

		clickedPartsRow: function ($target, action) {
			var self = this,
				$row = $target.closest('[data-field=row]');

			switch (action) {
				case 'buy':
					self.header.addToCart({'partNo':$row.attr('data-partNo')});
					break;
				case 'supersession':
					self.header.openSupersession({'partNo':$row.attr('data-partNo')});
					break;
				case 'applicability':
					self.header.openAdvancedFromApply($row);
					break;
				default:
					break;
			}
		},

		replaceCrumbs: function (type, code) {
			var self = this;

			self.crumbs.replaceSingle({'type': type, 'code': code});
			//self.crumbs.render();
		},

		loadLegendList: function (group, $target) {
			var self = this;

			self.layout.showLegendList();
			self.legendList.render(group.getImagesEls($target));
		},

		loadLegendParts: function ($target) {
			var self = this;
			var legendName = $target.attr('data-name');

			self.layout.showLegendParts();
			self.parts.load(self.crumbs.getCrumbsCode());
			self.legend.setTitle(legendName);
			self.legend.loadLegend({
				svgFile: $target.attr('data-svgFile'),
				gifFile: $target.attr('data-gifFile')
			});
		},

		buildCrumbsData: function (data, configs) {
			var self = this,
				from = $.getParameterByName('from');

			if(from == 'vin') {
				self.buildVinCrumbs(data, from);
			} else if(from == 'vehicle') {
				self.buildVehicleCrumbs(data, from);
			} else {
				self.buildModelCrumbs(data, from, configs);
			}
		},

		buildVinCrumbs: function (data, from) {
			var self = this;

			data.splice(2);
			data.push({
				type: 'vin',
				label: 'VIN',
				text: $.getParameterByName('vinNo'),
				url: null,
				isShow: true,
				click: false
			});
		},

		buildVehicleCrumbs: function (data, from) {
			var self = this;

			data.splice(2);
			data.push({
				type: 'vehicle',
				label: '整车编码',
				text: $.getParameterByName('vehicleCode'),
				url: null,
				isShow: true,
				click: false
			});
		},

		buildModelCrumbs: function (data, from, configs) {
			var self = this,
				modelCode = $.getParameterByName('modelCode'),
				modelGroupCode = $.getParameterByName('modelGroupCode'),
				imageCode = $.getParameterByName('imageCode'),
				config, index;

			if(modelCode.length == 0 && modelGroupCode.length == 0 && imageCode.length == 0) {
				for(var i = 0 ; i < configs.length; i++) {
					if(configs[i].type == 'model') {
						config = configs[i];
					}
				}
				for(var i = 0; i < data.length; i++) {
					if(data[i].type == 'series') {
						series = data[i];
						index = i;
					}
				}
				data.splice(i, 0, {
					type: 'model',
					label: config.label,
					text: '全部车型',
					url: self.crumbs.getUrl('model', null),
					isShow: config.isShow
				});
			}
		},

		openPrint: function () {
			var self = this,
				$checkedEl = self.group.getCheckedEl(),
				crumbsCode = self.crumbs.getCrumbsCode(),
				codes = {
					seriesCode: crumbsCode.seriesCode || '',
					modelGroupCode: crumbsCode.modelGroupCode || '',
					modelCode: crumbsCode.modelCode || '',
					imageCode: crumbsCode.imageCode || ''
				};
				self.renderNum = 0;
				self.interrupted = false;

				ajax.invoke({
					url: '/epc/model/print',
					type: 'GET',
					contentType: 'application/json',
					dataType: 'json',
					data: codes,
					beforeSend: function() {
						self.openPrintLayer();
					},
					success: function(data) {
						self.printId = data.id;
						self.getProgressBar(data);
					},
					failed: function(data) {
						self.$printProgressNum.text(data.msg || '打印出错');
						self.$printProgressSymbol.text('');
					}
				})
		},

		getProgressBar: function(data) {
			var self = this,
				params = {id: self.printId},
				delayTime = 0;

			ajax.invoke({
				url: '/epc/model/getProgress',
				type: 'POST',
				contentType: 'application/json',
				dataType: 'json',
				timeout: 1800000,
				data: JSON.stringify(params),
				success: function(data) {
					if(data.id != self.printId) { return;}
					if(self.interrupted) { return;}
					if(!data.success) { return;}
						
					self.afterProgressSuccess(data);
						
				},
				failed: function(data) {
					self.$printProgressNum.parent().text(data.msg || '打印出错');
				}
			})
		},

		afterProgressSuccess: function(data) {
			var self = this;

			self.percentArr.push(data.percent);
			if(self.percentArr.length === 1) {
				self.renderProgressBar(self.percentArr[0]);
			}
			if(!data.completed) {							
				self.getProgressBar();
			} else {
				if(data.interrupted) {
					return;
				}
				delayTime = self.percentArr.length === 0? 1: self.percentArr.length;
				if(data.data) {
					setTimeout(function(){
						window.location.href = data.data}, 1000 * delayTime + 200);
				} else {
					setTimeout(function(){
						self.$printProgressNum.text('未知错误，请重新尝试');
						self.$printProgressSymbol.text('');
					}, 1000 * delayTime);

				}
				self.complete = true;
			}
		},

		beforeStopPrint: function() {
			var self = this;

			if(self.complete) {
				self.closeLayer();
				return;
			}

			new Dialog({
                type:'warn',
                title:'提示',
                content: '关闭当前窗口会取消打印，确定关闭吗？',
                cancelBtn: true,
                onConfirm: function() {
                	self.stopPrint();
                }
        	});
		},

		stopPrint: function() {
			var self = this,
				params = {id: self.printId};

			ajax.invoke({
				url: '/epc/model/stopPrint',
				type: 'DELETE',
				contentType: 'application/json',
				dataType: 'json',
				timeout: 1800000,
				data: JSON.stringify(params),
				success: function() {
					self.interrupted = true;
				},
				complete: function() {
					self.closeLayer();
				}
			});
			self.closeLayer();
		},

		openPrintLayer: function() {
			var self = this;

			$.showBlockUI({
				message: $('#print-dialog'),
				name: 'print'
			});
			self.$closeLayerBtn.off('click').click(function() {
				self.beforeStopPrint();
			});
		},

		closeLayer: function() {
			var self = this;

			$.hideBlockUI({
				message: $('#print-dialog'),
				name: 'print',
				onUnblock: function() {
					self.$printProgressNum.text('0');
					self.$printProgressSymbol.text('%');
					self.$printProgressBar.css('width', 0);
				}
			});
		},

		renderProgressBar: function(percent) {
			var self = this;

			var originNum = 1 + parseInt(self.$printProgressNum.text()),
				currentNum = percent * 100,
				speed = 1000/(currentNum - originNum + 1);

			for(var i=originNum; i <= currentNum; i++) {
				(function() {
					var j = i;
					setTimeout(function() {
						self.$printProgressNum.text(j);
						
						if(j === currentNum) {
							self.percentArr.shift();
							if(self.percentArr.length > 0) {
								self.renderProgressBar(self.percentArr[0]);
							}
						}
					}, speed*(i-originNum));
				}());
			}

			self.$printProgressBar.animate({'width': currentNum + '%'}, 1000);
		}
		
	};

	model.init();

});