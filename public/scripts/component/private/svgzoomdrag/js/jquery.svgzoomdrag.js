/*!
 * jQuery svgZoomDrag plugin
 * Version 1.0-2014.10.24
 * @requires jQuery v1.4 or later
 */


(function($) {

	function setup(accistiveTpl) {

		// Load css file
		(function() {
			var link = document.createElement("link"),
				url = require.s.contexts._.config.baseUrl + basePath + 'css/svgzoomdrag.css';

			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = url;
			document.getElementsByTagName("head")[0].appendChild(link);
		})();

		// The internal private methods
		var svg = {

			init: function(target) {
				var me = this,
					url;

				me.degree = 0;
				me.isLoad = false;
				me.opts = $.data(target, "svgZoomDrag").options;
				me.buildWrap(target);
				me.buildAssistive();

				if (me.opts.svgUrl) {
					url = me.opts.svgUrl;
					me.loadSVG(url);
				} else {
					me.loadErrorImg();
				}
			},

			buildWrap: function(target) {
				var me = this,
					$target = $(target),
					svgTpl = '<div id="svg-wrap" class="svg-wrap"></div>';

				$target.append(svgTpl);
				me.$svgWrap = $target.find("#svg-wrap");
			},

			loadSVG: function(url, fnLoaded) {
				var me = this;

				if (me.xhr) {
					me.loadingHide();
					me.xhr.abort();
				}
				me.loadingShow();
				window.setTimeout(function() {
					me.removeSvgTag();
					me.$svgWrap.css("background", "none");
					me.xhr = d3.text(url, function(error, xmlStr) {
						if (error === null && me.isSVG(xmlStr)) {
							me.finishLoad(xmlStr, fnLoaded);
						} else {
							me.loadErrorImg();
						}
						me.loadingHide();
						me.xhr = null;
					});
				}, 1);
			},

			finishLoad: function(xmlStr, fnLoaded) {
				var me = this;

				me.disabledAccistiveTool(false);
				me.buildSVG(xmlStr);
				me.addEvents();
				me.resetTSR(me.viewport);

				if (typeof fnLoaded === "function") {
					fnLoaded.apply(me, [me.svg]);
				}
				if (typeof me.opts.callbacks.onLoaded === "function") {
					me.opts.callbacks.onLoaded.apply(me, [me.svg]);
				}
			},

			loadErrorImg: function() {
				var me = this,
					src = me.getNopicPath();

				me.disabledAccistiveTool(true);
				me.$svgWrap.css("background", "url(" + src + ") no-repeat center center");
			},

			buildSVG: function(xmlStr) {
				var me = this,
					$svg,
					svgTagStr = xmlStr.match(/<svg[^>]*>/i),
					svgTagInnerContent = xmlStr.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i),
					newXmlStr = svgTagStr + '<g>' + svgTagInnerContent[1] + ' </g> </svg>';

				me.$svgWrap.append(newXmlStr);
				$svg = me.$svgWrap.find("svg");
				me.svg = d3.select($svg[0]);
				me.viewport = me.svg.select("g");
			},

			addEvents: function() {
				var me = this,
					svgNode = me.svg.node;

				me.zoomScale = d3.behavior.zoom().scaleExtent([0.5, 10]);
				me.svg.call(me.zoomScale);
				me.zoomScale.on("zoom", function() {
					me.zoom(me.viewport);
				});
			},

			zoom: function(el) {
				var me = this,
					rotate = me.degree,
					scale = d3.event ? d3.event.scale : me.zoomScale.scale(),
					translate = d3.event ? d3.event.translate : me.zoomScale.translate();

				me.setTSR(el, translate, scale, rotate);
			},

			zoomIn: function(el) {
				if (this.zoomScale.scale() + 0.2 > 10) {
					return;
				}
				var me = this,
					degree = me.degree,
					scale = me.zoomScale.scale() + 0.2,
					localMatrix = me.getLocalMatrix(el, scale, degree);

				me.zoomScale.scale(scale);
				me.zoomScale.translate([localMatrix.e, localMatrix.f]);
				me.zoom(el);
			},

			zoomOut: function(el) {
				if (this.zoomScale.scale() - 0.2 < 0.5) {
					return;
				}
				var me = this,
					degree = me.degree,
					scale = me.zoomScale.scale() - 0.2,
					localMatrix = me.getLocalMatrix(el, scale, degree);

				me.zoomScale.scale(scale);
				me.zoomScale.translate([localMatrix.e, localMatrix.f]);
				me.zoom(el);
			},

			setTSR: function(el, translate, scale, rotate) {
				el.transition()
					.duration(0)
					.attr('transform', "translate(" + translate + ")scale(" + scale + ")rotate(" + rotate + ")");
			},

			rotate: function(el, delta) {
				var me = this,
					degree = me.degree,
					scale = me.zoomScale.scale(),
					degree = (delta === 1 ? degree + 30 : degree - 30),
					localMatrix = me.getLocalMatrix(el, scale, degree);

				me.setTSR(el, [localMatrix.e, localMatrix.f], scale, degree);
				me.zoomScale.translate([localMatrix.e, localMatrix.f]);
				me.degree = degree;

				// rotate callback function
				if (typeof me.opts.callbacks.onRotate === "function") {
					me.opts.callbacks.onRotate.apply(me, [degree]);
				}
			},

			getLocalMatrix: function(el, scale, degree) {
				var me = this,
					bbox = el.node().getBBox(),
					translate = {
						cx: bbox.width / 2,
						cy: bbox.height / 2,
						dx: (bbox.width - bbox.width * scale) / 2,
						dy: (bbox.height - bbox.height * scale) / 2
					},
					matrix = new Snap.Matrix(scale, 0, 0, scale, translate.dx, translate.dy),
					localMatrix = matrix.rotate(degree, translate.cx, translate.cy);

				return localMatrix;
			},

			resetSVG: function() {
				var me = this;

				self.loadingHide();
			},

			resetTSR: function(el) {
				var me = this;

				me.setTSR(el, [0, 0], 1, 0);
				me.zoomScale.scale(1);
				me.zoomScale.translate([0, 0]);
				me.degree = 0;
			},

			setElToCenter: function(target) {
				var me = this,
					el = me.viewport,
					svgNode = me.svg.node(),
					portMargin = me.getPortMargin(svgNode),
					portCTM = el.node().getCTM(),
					targetCTM = target.getCTM(),
					scale = me.zoomScale.scale(),
					degree = me.degree,
					mLeft = targetCTM.e - portCTM.e,
					mTop = targetCTM.f - portCTM.f,
					clientSize = svgNode.getBoundingClientRect(),
					translate = [
						((clientSize.width / 2 - portMargin.left - mLeft) / portCTM.a) * scale, ((clientSize.height / 2 - portMargin.top - mTop) / portCTM.a) * scale
					];

				me.setTSR(el, translate, scale, degree);
				me.zoomScale.translate(translate);
			},

			getPortMargin: function(node) {
				var me = this,
					screenCTM;

				if (node.getCTM()) {
					return {
						left: node.getCTM().e,
						top: node.getCTM().f
					}
				} else {
					screenCTM = node.getScreenCTM();
					return {
						left: screenCTM.e - $(node).offset().left,
						top: screenCTM.f - $(node).offset().top
					}
				}
			},

			removeSvgTag: function() {
				var me = this;

				me.$svgWrap.find("svg").remove();
			},

			loadingShow: function() {
				var me = this;

				me.$svgWrap.showLoading({
					"indicatorZIndex": 401,
					"overlayZIndex": 400
				});
			},

			loadingHide: function() {
				var me = this;

				me.$svgWrap.hideLoading();
			},

			getScale: function() {
				var me = this;

				return me.zoomScale.scale();
			},

			getRotate: function() {
				var me = this;

				return me.degree;
			},

			getNopicPath: function() {
				var me = this,
					nopic = me.opts.nopic,
					path = me.opts.host + "/scripts/" + basePath + "res/" + nopic;

				return path;
			},

			buildAssistive: function() {
				var me = this,
					toolTpl = me.getToolTpl();

				me.$assistive = $(toolTpl).show();
				me.$svgWrap.append(me.$assistive);
				me.initAssistiveEvent();
				me.assistiveDock();
			},

			initAssistiveEvent: function() {
				var me = this;

				me.$assistive.on("mousedown", function(e) {
					me.startDragAssistive(e, this);
				});

				me.$assistive.on("click", "a:not([class*='disabled'])", function(e) {
					var el = me.viewport,
						action = $(this).attr("data-action");

					switch (action) {
						case "zoomin":
							me.zoomIn(el);
							break;
						case "zoomout":
							me.zoomOut(el);
							break;
						case "reset":
							me.resetTSR(el);
							if (typeof me.opts.callbacks.onReset === "function") {
								me.opts.callbacks.onReset.apply(me, [0]);
							}
							break;
						case "leftrotate":
							me.rotate(el, 0);
							break;
						case "rightrotate":
							me.rotate(el, 1);
							break;
						default:
							break;
					}
					if (me.opts.callbacks.onToolClick) {
						me.opts.callbacks.onToolClick.apply(me, [action]);
					}
				});
			},

			disabledAccistiveTool: function(disabled) {
				var me = this,
					$zoomOut = me.$assistive.find("[data-action=zoomout]"),
					$zoomIn = me.$assistive.find("[data-action=zoomin]"),
					$reset = me.$assistive.find("[data-action=reset]"),
					$leftrotate = me.$assistive.find("[data-action=leftrotate]"),
					$rightrotate = me.$assistive.find("[data-action=rightrotate]");

				if (disabled) {
					$zoomOut.removeClass("assistive-tool-zoomout").addClass("assistive-tool-zoomout-disabled");
					$zoomIn.removeClass("assistive-tool-zoomin").addClass("assistive-tool-zoomin-disabled");
					$reset.removeClass("assistive-tool-reset").addClass("assistive-tool-reset-disabled");
					$leftrotate.removeClass("assistive-tool-left-rotate").addClass("assistive-tool-left-rotate-disabled");
					$rightrotate.removeClass("assistive-tool-right-rotate").addClass("assistive-tool-right-rotate-disabled");
				} else {
					$zoomOut.removeClass("assistive-tool-zoomout-disabled").addClass("assistive-tool-zoomout");
					$zoomIn.removeClass("assistive-tool-zoomin-disabled").addClass("assistive-tool-zoomin");
					$reset.removeClass("assistive-tool-reset-disabled").addClass("assistive-tool-reset");
					$leftrotate.removeClass("assistive-tool-left-rotate-disabled").addClass("assistive-tool-left-rotate");
					$rightrotate.removeClass("assistive-tool-right-rotate-disabled").addClass("assistive-tool-right-rotate");
				}
			},

			dragMove: function(target, position) {
				$(target).css({
					"left": position.left + "px",
					"top": +position.top + "px"
				});
			},

			getMovePosition: function(e, position) {
				var me = this,
					svgWrap = me.getSizeAndPosition(me.$svgWrap),
					top = (e.pageY - svgWrap.offsetTop - position.top),
					left = (e.pageX - svgWrap.offsetLeft - position.left);

				return {
					top: top,
					left: left
				};
			},

			getSizeAndPosition: function($domEl) {

				return {
					width: $domEl.width(),
					height: $domEl.height(),
					top: $domEl.position().top,
					left: $domEl.position().left,
					offsetTop: $domEl.offset().top,
					offsetLeft: $domEl.offset().left
				};
			},

			assistiveDock: function() {
				var me = this,
					dock = me.opts.dock || "TL",
					maxTop = me.$svgWrap.height() - me.$assistive.height() - 5,
					maxLeft = me.$svgWrap.width() - me.$assistive.width() - 5,
					content = (maxLeft / 2);

				switch (dock) {
					case "TL":
						me.$assistive.css({
							"left": "5px",
							"top": "5px"
						});
						break;
					case "TC":
						me.$assistive.css({
							"left": content + "px",
							"top": "5px"
						});
						break;
					case "TR":
						me.$assistive.css({
							"left": maxLeft + "px",
							"top": "5px"
						});
						break;
					case "BL":
						me.$assistive.css({
							"left": "5px",
							"top": maxTop + "px"
						});
						break;
					case "BC":
						me.$assistive.css({
							"left": content + "px",
							"top": maxTop + "px"
						});
						break;
					case "BR":
						me.$assistive.css({
							"left": maxLeft + "px",
							"bottom": "0px"
						});
						break;
					default:
						break;
				}
			},

			startDragAssistive: function(e, target) {
				var me = this,
					position = {},
					movePosition = {},
					svgWrap = me.getSizeAndPosition(me.$svgWrap),
					assistive = me.getSizeAndPosition(me.$assistive);

				// Save click legend position
				position.top = e.pageY - svgWrap.offsetTop - assistive.top;
				position.left = e.pageX - svgWrap.offsetLeft - assistive.left;

				// Bind document object 'mousemove' and 'mouseup' event
				$(document).bind({
					"mousemove.svg": function(e) {
						movePosition = me.movingRange(e, target, position);
						me.dragMove(target, movePosition);
						e.preventDefault();
					},
					"mouseup.svg": function() {
						$(this).unbind("mousemove.svg mouseup.svg");
						e.preventDefault();
					}
				});
			},

			getToolTpl: function() {
				var self = this,
					assistiveTool = self.opts.assistiveTool;

				return $(accistiveTpl).wrap("<div></div>")
					.parent()
					.find("div[data-template-id='" + assistiveTool + "']")
					.get(0).outerHTML;
			},

			movingRange: function(e, target, position) {
				var me = this,
					minleft = 5,
					minTop = 5,
					movePosition = me.getMovePosition(e, position),
					maxLeft = me.$svgWrap.width() - $(target).width() - 5,
					maxTop = me.$svgWrap.height() - $(target).height() - 5;

				if (movePosition.left < minleft) {
					movePosition.left = minleft;
				}
				if (movePosition.top < minTop) {
					movePosition.top = minTop;
				}
				if (movePosition.left > maxLeft) {
					movePosition.left = maxLeft;
				}
				if (movePosition.top > maxTop) {
					movePosition.top = maxTop;
				}

				return movePosition;
			},

			isSVG: function(xmlStr) {
				var me = this;

				return xmlStr.match(/<svg[^>]*>/i) ? true : false;
			}
		};

		// Extend jquery svgZoomDrag method
		$.fn.svgZoomDrag = function(options, params) {
			var me = this;

			if (typeof options === "string") {
				return $.fn.svgZoomDrag.methods[options](params);
			}

			return me.each(function() {

				$.data(this, 'svgZoomDrag', {
					options: $.extend({}, $.fn.svgZoomDrag.defaults, options || {})
				});

				svg.init(this);
			});
		};

		// External public methods
		$.fn.svgZoomDrag.methods = {

			loadSVG: function(options) {
				var url = options.url,
					loaded = options.loaded || null;

				return svg.loadSVG(url, loaded);
			},

			resetTSR: function(el) {
				return svg.resetTSR(el);
			},

			getScale: function() {
				return svg.getScale();
			},

			getRotate: function() {
				return svg.getRotate();
			},

			setElToCenter: function(target) {
				return svg.setElToCenter(target);
			}
		};

		// default options
		$.fn.svgZoomDrag.defaults = {
			maxZoom: 20,
			minZoom: 0.08,
			dock: "TL",
			assistiveTool: 1,
			nopic: "nopic.gif",
			callbacks: {
				onLoaded: null,
				onRotate: null,
				onToolClick: null,
				onReset: null
			}
		};
	}

	/* Using require js AMD standard */
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		function getPath() {
			var splittedPath,
				config = require.s.contexts._.config,
				path = config.paths["jquerySvgZoomDrag"];

			if (typeof path !== "undefined") {
				splittedPath = path.split(/\/+/g);
				return splittedPath.slice(0, splittedPath.length - 2).join("/") + "/";
			} else {
				alert("require config paths 'jquerySvgZoomDrag' key not exist")
			}
		}
		var basePath = getPath();

		if (typeof basePath !== "undefined") {
			define(['text!' + basePath + 'tpl/assistive.htm', "d3"],
				setup);
		}
	}


})(jQuery);