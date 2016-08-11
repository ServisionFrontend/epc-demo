define([
    'ajax',
    hasSVG() ? "jquerySvgHotpoint" : "hotpoint",
    'jquery',
    'scrollIntoView',
    'snap',
    'blockUI'
], function(ajax, Hotpoint) {

    var defaultOpts = {
        callbacks: {
            onSelectionCallout: null
        }
    };

    var Legend = function(options) {
        this.opts = $.extend({}, defaultOpts, options || {});
        this.init();
    };

    Legend.prototype = {

        init: function() {
            var self = this;

            self.bindEls();
            self.bindAttr();
            self.initComponent();
        },

        bindEls: function() {
            var self = this;

            self.$legendTitle = $('#legend-title');
            self.$legendBody = $('#legend-body');
        },

        bindAttr: function() {
            var self = this;

            self.timer1 = null;
            self.timer2 = null;
        },

        initComponent: function() {
            var self = this;

            if (hasSVG()) {
                self.initSvgHotpoint();
            } else {
                self.initGifHotpoint();
            }
        },

        initSvgHotpoint: function() {
            var self = this;

            self.$legendBody.svgHotpoint({
                host: '',
                tbodyId: "parts-body",
                rowBgColor: "#A7CDF1",
                callbacks: {
                    onSelectionCallout: function(callout) {
                        if (typeof self.opts.callbacks.onSelectionCallout === 'function') {
                            self.opts.callbacks.onSelectionCallout.apply(null, [
                                [callout]
                            ]);
                        }
                    }
                }
            });
        },

        initGifHotpoint: function() {
            var self = this;

            self.hotpoint = new Hotpoint({
                radius: 10,
                dock: "TL",
                radius: 10,
                assistiveTool: "3",
                tbodyId: "parts-body",
                renderToId: "legend-body",
                selectedRowBgClass: "checked",
                nopic: '../styles/images/arrow_icon.png',
                callbacks: {
                    onSelectionCallout: function(callouts) {
                        if (typeof self.opts.callbacks.onSelectionCallout === 'function') {
                            self.opts.callbacks.onSelectionCallout.apply(null, [callouts]);
                        }
                    },
                    onLegendDbClick: function() {
                        if (this.opts.legendExist) {
                            this.resetLegend();
                            this.redraw();
                        }
                    }
                }
            });
        },

        loadLegend: function(params) {
            var self = this;

            self.legendLoaded = false;
            if (hasSVG()) {
                self.loadSvgLegend(params);
            } else {
                self.loadGifLegend(params);
            }
        },

        loadSvgLegend: function(params) {
            var self = this,
                svgPath = params.svgFile;

            self.$legendBody.svgHotpoint("loadSVG", {
                url: svgPath,
                loaded: function() {
                    self.legendLoaded = true;
                }
            });
        },

        loadGifLegend: function(params) {
            var self = this,
                svgPath = params.svgFile;

            // load svg file, to get callout
            ajax.invoke({
                type: "GET",
                url: svgPath,
                dataType: "text",
                success: function(svgXml) {
                    self.bindGifLegend(svgXml, params);
                },
                failed: function(error) {
                    self.hotpoint.destroyLegend();
                    self.hotpoint.loadErrorImg();
                }
            });
        },

        bindGifLegend: function(svgXml, params) {
            var self = this,
                svgSize = {},
                callouts = [],
                gifPath = params.gifFile;

            if (self.isSVG(svgXml)) {
                svgSize = self.getSvgSize(svgXml);
                callouts = self.extractCallouts(svgXml);
            }
            self.hotpoint.bindLegend({
                src: gifPath,
                data: callouts,
                swfLegendWidth: svgSize.width,
                swfLegendHeight: svgSize.height
            });

            self.legendLoaded = true;
        },

        extractCallouts: function(svgXml) {
            var self = this,
                callouts = [],
                texts = svgXml.match(/<text .*>([^<]{1,3})<\/text>/g) || [];

            for (var i = 0; i < texts.length; i++) {
                var callout = texts[i].match("<([a-zA-Z]+).*?>(.*?)</\\1>")[2],
                    matrixStr = texts[i].match(/matrix\((.+)\)/i),
                    translate = matrixStr[1].split(' ');

                callouts.push({
                    callout: callout,
                    x: parseInt(translate[4]) + 5,
                    y: parseInt(translate[5]) - 5
                });
            }

            return callouts;
        },

        getSvgSize: function(xmlStr) {
            var self = this,
                svgTagStr = xmlStr.match(/<svg[^>]*>/i),
                svgNode = $.parseXML(svgTagStr[0] + " </svg>").documentElement;

            return {
                width: parseFloat(svgNode.getAttribute("width")),
                height: parseFloat(svgNode.getAttribute("height"))
            };
        },

        linkLegend: function(callouts) {
            var self = this;

            if (callouts.length == 0) return;

            clearTimeout(self.timer1);
            clearInterval(self.timer2);

            self.timer1 = setTimeout(function() {
                clearInterval(self.timer2);
            }, 30 * 1000);

            self.timer2 = setInterval(function() {
                if (self.legendLoaded) {
                    if (hasSVG()) {
                        self.$legendBody.svgHotpoint("highlightCallout", callouts);
                    } else {
                        self.hotpoint.linkHotpoint(callouts);
                    }
                    clearTimeout(self.timer1);
                    clearInterval(self.timer2);
                }
            }, 200);
        },

        isSVG: function(xmlStr) {
            var me = this;

            return xmlStr.match(/<svg[^>]*>/i) ? true : false;
        },

        setTitle: function(name) {
            var self = this;

            self.$legendTitle.text(name);
        }
    };

    return Legend;

});