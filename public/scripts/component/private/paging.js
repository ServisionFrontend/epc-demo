/*!
 * search component
 * version 1.0-2015.1.5
 * @requires
 */
;
(function($) {

	function setup(ajax) {

		var Paging = function(options) {
			this.opts = $.extend(true, {}, defaultOpts, options || {});

			this.curPage = 1;
			this.pageCount = 0;
			this.pageSize = this.opts.pageSize;

			this.init();
		}

		Paging.prototype = {

			init: function() {
				var self = this;

				self.buildEl();
				self.initEvents();
			},

			buildEl: function() {
				var self = this,
					opts = self.opts;

				self.$pagingWrap = $('#' + opts.pagingWrapId);

				self.$btnCtrlPages = self.$pagingWrap.find(".page-ctrl-btn");
				self.$pageCount = self.$pagingWrap.find("[data-id='" + opts.pageCountId + "']");
				self.$recordCount = self.$pagingWrap.find("[data-id='" + opts.recordCountId + "']");
				self.$currentPage = self.$pagingWrap.find("[data-id='" + opts.currentPageId + "']");
				self.$currentPageView = self.$pagingWrap.find("[data-id='" + opts.currentPageViewId + "']")
				self.$topPage = self.$pagingWrap.find("[data-id='" + opts.topPageId + "']");
				self.$prevPage = self.$pagingWrap.find("[data-id='" + opts.prevPageId + "']");
				self.$nextPage = self.$pagingWrap.find("[data-id='" + opts.nextPageId + "']");
				self.$bottomPage = self.$pagingWrap.find("[data-id='" + opts.bottomPageId + "']");
				self.$gotoPage = self.$pagingWrap.find("[data-id='" + opts.gotoPageId + "']");
				self.$pageBtns = self.$pagingWrap.find("[data-id='" + opts.pageBtnsId + "']")
			},

			initEvents: function() {
				var self = this;

				self.$btnCtrlPages.on("click", function() {
					if (!$(this).hasClass('disable')) {
						self.doPaging(this);
					}
				});

				// 定向指定页
				self.$gotoPage.on('click', function() {
					if(!$(this).hasClass('disable')) {
						self.gotoPage();
					}
				});

				// 文本框回车定向指定页
				self.$currentPage.on('keydown', function(e) {
					if (e.keyCode === 13) {
						self.gotoPage();
					}
				});

				self.$pageBtns.on('click', 'a', function () {
					self.$currentPage.val(parseInt($(this).text()));
					self.gotoPage();
				})

				// ie浏览器禁用分页过快选中
				self.$pagingWrap.on('selectstart', function() {
					return false;
				});
			},

			on: function(evtName, evtFun) {
				var self = this;

				if (evtName === 'onSelectPage') {
					self.opts.callbacks.onSelectPage = evtFun;
				}
			},

			doPaging: function(target) {
				var self = this,
					itemId = $(target).attr("data-id");

				switch (itemId) {
					case "top":
						if (self.pageCount > 1)
							self.curPage = 1;
						break;
					case "prev":
						if (self.curPage > 1)
							self.curPage--;
						break;
					case "next":
						if (self.curPage < self.pageCount)
							self.curPage++;
						break;
					case "bottom":
						if (self.pageCount > 1 && self.curPage != self.pageCount)
							self.curPage = self.pageCount;
						break;
					default:
						break;
				}

				self.operation();
			},

			gotoPage: function() {
				var self = this,
					curPage = self.$currentPage.val();

				if(self.pageCount === 0) return;

				if (!/^[0-9]+$/.test(curPage)) {
					self.curPage = 1;
				} else {
					if (parseInt(curPage) > self.pageCount) {
						self.curPage = self.pageCount;
					} else {
						self.curPage = parseInt(curPage);
					}
				}

				self.operation();
			},

			operation: function() {
				var self = this;

				if (typeof self.opts.callbacks.onSelectPage === 'function') {
					self.opts.callbacks.onSelectPage.apply(null, [self.curPage]);
				}
			},

			setPagination: function(total) {
				var self = this;

				self.pageCount = self.getPageCount(total);
				self.$pageCount.text(self.pageCount);
				self.$recordCount.text(total);
				self.$currentPage.val(self.curPage);
				self.$currentPageView.text(self.curPage);
				self.setPageBtn(self.pageCount);
				self.setPagingStatus();
				total > self.pageSize ? self.$gotoPage.removeClass('disable') : self.$gotoPage.addClass('disable');
			},

			getPagination: function() {
				var self = this;

				return {
					page: self.curPage || 1,
					size: self.opts.pageSize
				};
			},

			setPageBtn: function (pageCount) {
				var self = this,
					pageBtnSize = self.opts.pageBtnSize;

				self.$pageBtns.html('');
				if(pageCount === 0) {
					return;
				} else if (pageCount <= pageBtnSize) {
					self.renderPageBtn(1, pageCount, pageCount);
				} else {
					if(self.curPage == 1) {
						self.renderPageBtn(1, pageBtnSize, pageCount);
					} else if (self.curPage == pageCount) {
						self.renderPageBtn(pageCount - pageBtnSize + 1, pageCount, pageCount);
					} else {
						self.renderPageBtn(self.curPage - 1, self.curPage + 1, pageCount);
					}
				}
			},

			renderPageBtn: function (start, end, pageCount) {
				var self = this,
					ellipsisLeft = '<span class="ellipsis"></span>',
					ellipsisRight = '<span class="ellipsis"></span>',
					output = '';

				for(var i = start; i <= end; i++) {
					if(i == self.curPage) {
						output += "<a data-id='page' class='current-page' href='javascript:;'>" + i + "</a>";
					} else {
						output += "<a data-id='page' href='javascript:;'>" + i + "</a>";
					}
					if(i == 1) {
						ellipsisLeft = '';
					}
					if(i == pageCount) {
						ellipsisRight = '';
					}
				}

				self.$pageBtns.html(ellipsisLeft + output + ellipsisRight);
			},

			reset: function() {
				var self = this;

				self.curPage = 1;
				self.pageCount = 0;
				self.$pageCount.text(0);
				self.$recordCount.text(0);
				self.$currentPage.val(self.curPage);
				self.$currentPageView.text(self.curPage);
				self.setPageBtn(0);
				self.setPagingStatus();
			},

			getPageCount: function(recordCount) {
				var self = this,
					pageSize = self.opts.pageSize;

				return (recordCount % pageSize == 0) ? (parseInt(recordCount / pageSize)) : (parseInt(recordCount / pageSize) + 1);
			},

			setPagingStatus: function() {
				var self = this;

				self.$btnCtrlPages.not('.disable').addClass("disable")

				if (self.curPage > 1 && self.curPage < self.pageCount) {
					self.$btnCtrlPages.removeClass("disable");
				} else if (self.curPage === 1 && self.pageCount > 1) {
					self.$nextPage.removeClass("disable");
					self.$bottomPage.removeClass("disable");
				} else if (self.pageCount === self.curPage && self.curPage > 1) {
					self.$topPage.removeClass("disable");
					self.$prevPage.removeClass("disable");
				}
			},

			clearEmpty: function () {
				var self = this;

				self.setPagination(0);
			}
		};

		var defaultOpts = {
			pageSize: 10,
			gotoPageId: "go",
			topPageId: "top",
			prevPageId: "prev",
			nextPageId: "next",
			bottomPageId: "bottom",
			pageCountId: "pageCount",
			recordCountId: "recordCount",
			currentPageId: "curPage",
			currentPageViewId: "curPageView",
			pageBtnsId: "pageBtns",
			pageBtnSize: 3,
			callbacks: {
				onQuery: null,
				onReset: null
			}
		};

		return Paging;
	}

	define(['ajax'], setup);

})(jQuery);