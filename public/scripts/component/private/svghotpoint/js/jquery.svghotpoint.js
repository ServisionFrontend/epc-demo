/*!
 * jQuery svghotpoint plugin
 * Version 1.0-2014.10.24
 * @requires jQuery v1.4 or later
 */

(function($) {

    function setup() {

        // The internal private methods
        var hotpoint = {

            init: function(target) {
                var me = this;

                me.$target = $(target);
                me.opts = $.data(target, "svgHotpoint").options;
                me.buildDomEl();
                me.initComponent(target);
            },

            buildDomEl: function() {
                me = this;

                me.$tbody = $("#" + me.opts.tbodyId);
            },

            initComponent: function(target) {
                var me = this,
                    svg = me.opts.svg,
                    svgUrl = me.opts.svgUrl || "";

                me.$target.svgZoomDrag({
                    host:me.opts.host,
                    svgUrl: svgUrl,
                    dock: "TL",
                    assistiveTool: 3,
                    callbacks: {
                        onLoaded: function(svg) {
                            me.finishLoaded(svg);
                        },
                        onRotate: function (degree) {
                            me.setCalloutDegree(degree);
                        },
                        onReset: function() {
                            me.resetCalloutDegree();
                        },
                        onToolClick: function(action) {
                            if (typeof me.opts.callbacks.onToolClick === "function") {
                                me.opts.callbacks.onToolClick.apply(me, [action]);
                            }
                        }
                    }
                });
            },

            finishLoaded: function(svg) {
                var me = this;

                me.svg = svg;
                me.viewport = svg.select("g");
                me.texts = me.getTexts();
                me.setCalloutOriginalPosition();
                me.initEvents();
            },

            setCalloutOriginalPosition: function() {
                var me = this;

                me.texts.each(function() {
                    var item = Snap(this),
                        matrix = item.transform().localMatrix.toString();

                    $(item.node).css("cursor", "pointer");
                    item.data("data-matrix", matrix);
                    item.data("data-bbox", item.getBBox());
                });
            },

            initEvents: function() {
                var me = this;

                me.texts.on({
                    "click": function() {
                        me.selectionCallout(this);
                    },
                    "touchstart": function() {
                        me.selectionCallout(this);
                    },
                    "mouseover": function(e) {
                        me.calloutIn(this, e);
                    },
                    "mouseout": function(e) {
                        me.calloutOut(this, e);
                    }
                });
                me.$tbody.on('click', 'tr[data-callout]', function () {
                    var callout = $(this).attr("data-callout");
                    
                    me.partsToLegend([callout]);
                });

                me.$target.contextmenu(function(){
                    return false;
                });
            },

            selectionCallout: function(target) {
                var me = this,
                    $row,
                    callout = $(target).text(),
                    texts = me.getCalloutTexts([callout]);

                me.highlightCallout(texts);

                if (typeof me.opts.callbacks.onSelectionCallout === "function") {
                    me.opts.callbacks.onSelectionCallout.apply(me, [callout]);
                }
            },

            resetCalloutDegree: function(){
                var me = this;

                me.texts.each(function () {
                    var item = Snap(this),
                        matrix = item.data("data-matrix");

                    item.animate({ x:0 , y: 0}, 0);
                    item.animate({
                        transform: matrix
                    }, 0);
                });
            },

            setCalloutDegree: function(degree) {
                var me = this;

                me.texts.each(function() {
                   var item = Snap(this),
                       bbox = item.data("data-bbox");

                   item.animate({x:bbox.x, y:(bbox.y + 12)}, 0);
                   item.animate({
                        transform: "r" + (degree > 0 ? -degree : Math.abs(degree)) + ", " + bbox.cx + ", " + bbox.cy
                   }, 0);
                });
            },

            partsToLegend: function(callouts) {
                var me = this,
                    texts = me.getCalloutTexts(callouts);

                if (texts.length && texts.length > 0) {
                    me.highlightCallout(texts);
                    me.calloutIntoView(texts);
                }
            },

            highlightCallout: function(texts) {
                var me = this,
                    stroke = "#E30A0A",
                    flag = "selected";

                me.removeCircle(flag);

                texts.each(function() {
                    me.appendCircle(this, stroke, flag);
                });
            },

            calloutIntoView: function(texts) {
                var me = this,
                    isVisible = me.getCalloutVisible(texts),
                    scale = me.$target.svgZoomDrag("getScale"),
                    rotate = me.$target.svgZoomDrag("getRotate");

                if (!isVisible) {
                    if (texts.length > 1 || scale === 1 || rotate !==0) {
                        me.$target.svgZoomDrag("resetTSR", me.viewport);
                        me.resetCalloutDegree();
                    } else {
                        me.calloutMoveCenter(texts.node());
                    }
                }
            },

            getCalloutVisible: function(texts) {
                var me = this, isVisible = true;
                    clientSize = me.svg.node().getBoundingClientRect(),
                    scale = me.$target.svgZoomDrag("getScale"),
                    minLeft = (scale * 10) / 2,
                    minTop = (scale * 10) / 2,
                    maxLeftRange = clientSize.width - (10 * scale) / 2,
                    maxTopRange = clientSize.height - (10 * scale) / 2;

                texts.each(function() {
                    var itemSize = me.getNodeSize(this);
                    if ((itemSize.x < minLeft || itemSize.y < minTop) || (itemSize.x > maxLeftRange || itemSize.y > maxTopRange)) {
                        isVisible = false;
                        return false;
                    }
                });

                return isVisible;
            },

            calloutMoveCenter: function(item) {
                var me = this,
                    el = me.viewport;

                me.$target.svgZoomDrag("setElToCenter", item);
            },

            getNodeSize: function(node) {
                var me = this,
                    bbox = node.getBBox(),
                    ctm = node.getCTM(),
                    nodeClientRect = node.getBoundingClientRect(),
                    svgClientRect = me.svg.node().getBoundingClientRect();

                return {
                    x: nodeClientRect.left- svgClientRect.left,
                    y: nodeClientRect.top - svgClientRect.top,
                    width: bbox.width,
                    height: bbox.height,
                    scale: ctm.a
                };
            },

            scrollIntoView: function($row) {
                var me = this;

                $row.scrollIntoView();
            },

            changeRowBg: function($rows) {
                var me = this;

                // reset rows backgrount color
                me.resetRowBg();

                // save original color
                $rows.each(function(index, item) {
                    var color = $(item).css("background-color");
                    $(item).attr("data-original-color", color);
                });

                // setting current color
                $rows.css("background-color", me.opts.rowBgColor);
            },

            resetRowBg: function() {
                var me = this,
                    $rows = me.$tbody.find("tr[data-original-color]");

                $rows.each(function(index, item) {
                    var originalColor = $(item).attr("data-original-color");

                    $(item).css("background-color", originalColor);
                    $(item).removeAttr("data-original-color");
                });
            },

            loadSVG: function(options) {
                var me = this;

                me.$target.svgZoomDrag("loadSVG", options);
            },

            calloutIn: function(target) {
                var me = this,
                    flag = "temp",
                    stroke = "#FFDD02",
                    callout = $(target).text();

                me.appendCircle(target, stroke, flag);
            },

            calloutOut: function() {
                var me = this,
                    flag = "temp";

                me.removeCircle(flag);
            },

            removeCircle: function(flag) {
                var me = this;

                $(me.viewport.node).find('circle[flag="' + flag + '"]').remove();
            },

            appendCircle: function(target, stroke, flag) {
                var me = this,
                    bbox = Snap(target).getBBox(),
                    circle = me.createCircle(bbox.cx, bbox.cy, stroke, flag);

                me.viewport.node().appendChild(circle);
            },

            createCircle: function(cx, cy, stroke, flag) {
                var r = 18,
                    circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

                circle.setAttribute("flag", flag);
                circle.setAttribute("cx", cx);
                circle.setAttribute("cy", cy);
                circle.setAttribute("r", r);
                circle.setAttribute("stroke", stroke);
                circle.setAttribute("stroke-width", 3);
                circle.setAttribute("fill", "none");

                return circle;
            },

            getCalloutTexts: function(callouts) {
                var me = this,
                    texts = me.texts.filter(function () {
                        var callout = $(this).text();

                        return $.inArray(callout, callouts) > -1;
                    });

                return texts;
            },

            getTexts: function(callout) {
                var me = this,
                    texts = me.svg
                    .selectAll("text")
                    .filter(function() {
                        var callout = $(this).text();
                        return /^\w{1,3}$/.test(callout);
                    });

                return texts;
            }
        };

        // Extend jquery svgZoomDrag method
        $.fn.svgHotpoint = function(options, params) {
            var me = this;

            if (typeof options === "string") {
                return $.fn.svgHotpoint.methods[options](params);
            }

            return me.each(function() {

                $.data(this, 'svgHotpoint', {
                    options: $.extend({}, $.fn.svgHotpoint.defaults, options || {})
                });

                hotpoint.init(this);
            });
        };

        // External public methods
        $.fn.svgHotpoint.methods = {

            highlightCallout: function(callout) {
                return hotpoint.partsToLegend(callout);
            },

            loadSVG: function(path) {
                return hotpoint.loadSVG(path);
            }
        };

        // default options
        $.fn.svgHotpoint.defaults = {
            maxZoom: 20,
            minZoom: 0.08,
            radius: 18,
            rowBgColor: "#ccc",
            svgUrl: null,
            dock: "TC",
            tbodyId: null,
            callbacks: {
                onSelectionCallout: null
            }
        };
    }

    /* Using require js AMD standard */
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(["jquerySvgZoomDrag", "scrollIntoView"], setup);
    }

})(jQuery);