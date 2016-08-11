
/******Image
Zoom,Drag 
*******/
define(["jquery", "mousewheel"],
    function () {
        var Image = function (options) {
            this.$btnZoomIn = $("#" + options.zoomIn || "");
            this.$btnZoomOut = $("#" + options.zoomOut || "");
            this.$btnZoomNative = $("#" + options.zoomNative || "");
            this.$imgNative = $("#" + options.imgNative);
            this.$divNative = $("#" + options.divNative);
            this.mousewheelEnabled = false;
            this.nativeWidth = 0;
            this.nativeHeight = 0;
            this.zoomRatios = 1.2;
            this.maxRatios = 3;
            this.minRatios = 0.4;
            this.dragposition = { left: 0, top: 0 };
            this.target = { x: 0, y: 0 };
            this.init();
        };

        Image.prototype = {
            //initialize
            init: function () {
                var self = this;
                self.nativeWidth = self.$imgNative.width();
                self.nativeHeight = self.$imgNative.height();
                self.load();
            },

            //load event and listen into mouse roll
            load: function () {
                var self = this;
                //使用mousewheel 插件
                //self.addScrollListener(window, $.proxy(self.wheelHandle, self));
                self.addbindEvent();
            },

            addbindEvent: function () {
                var self = this;
                self.mousewheelEnabled && self.$divNative.on("mousewheel", function (event, delta) {
                    if (delta > 0) {
                        self.bindButton("*", event);
                    }
                    else if (delta < 0) {
                        self.bindButton("/", event);
                    }
                });

                self.$imgNative.bind("mousedown", function (e) {
                    //OptionDesc;

                    $(this).css("cursor", 'url("style/images/grabbing.cur"),pointer');
                    self.dragposition.left = e.pageX - self.$divNative.offset().left - (e.pageX - $(this).offset().left);
                    self.dragposition.top = e.pageY - self.$divNative.offset().top - (e.pageY - $(this).offset().top);
                    self.target.x = e.pageX;
                    self.target.y = e.pageY;
                    self.registerEvent(e, this);
                    e.preventDefault();
                }).bind("mouseup", function () {
                    $(this).css("cursor", 'url("style/images/grab.cur"),pointer');
                });

                self.$btnZoomIn.bind("click", function () {
                    self.bindButton("*");
                });
                self.$btnZoomOut.bind("click", function () {
                    self.bindButton("/");
                });
                self.$btnZoomNative.bind("click", function () {
                    self.bindButton("native");
                });
            },

            //The binding is loaded after the mouse press event
            registerEvent: function (e, sender) {
                var self = this;
                //
                $(document).bind({
                    mousemove: function (e) {
                        self.drawMoveImg(e, sender);
                        e.preventDefault();
                    },
                    mouseup: function (e) {
                        $(this).unbind("mouseup")
                               .unbind("mousemove");
                        e.preventDefault();
                    }
                });
            },

            //Draw move image position
            drawMoveImg: function (e, sender) {

                var self = this;
                var left = self.dragposition.left + e.pageX - self.target.x;
                var top = self.dragposition.top + e.pageY - self.target.y;

                self.$imgNative.css({ "left": left + "px", "top": +top + "px" });
            },

            bindButton: function (sender, e) {
                var self = this;
                var data = self.loadEvent(sender, e);
                if (data == null) return;
                self.$imgNative.stop().animate({
                    "width": data.width,
                    "height": data.height,
                    "top": data.top,
                    "left": data.left
                }, 'fast');
            },

            loadEvent: function (sender, e) {
                var self = this,
                    percent,
                    cureentW = self.$imgNative.width(),
                    cureentH = self.$imgNative.height(),
                    nW = 0,
                    nH = 0,
                    top, left;

                if (sender == "native") {
                    nW = self.nativeWidth;
                    nH = self.nativeHeight;
                }
                else if (sender == "*") {
                    nW = cureentW * self.zoomRatios;
                    nH = cureentH * self.zoomRatios;
                }
                else if (sender == "/") {
                    nW = cureentW / self.zoomRatios;
                    nH = cureentH / self.zoomRatios;
                }
                percent = nW / self.nativeWidth;
                if (percent > self.maxRatios || percent < self.minRatios) return;

                top = (self.$divNative.height() - nH) / 2;
                left = (self.$divNative.width() - nW) / 2;

                if (e) {
                    var dTop = self.$imgNative.position().top,
                        dLeft = self.$imgNative.position().left,
                        oL = e.pageX - self.$divNative.offset().left,
                        oT = e.pageY - self.$divNative.offset().top,
                        posTop = oT - dTop,
                        posLeft = oL - dLeft,
                        topPercent = (posTop / cureentH).toFixed(2),
                        leftPercent = (posLeft / cureentW).toFixed(2),
                        top = oT - (nH * topPercent),
                        left = oL - (nW * leftPercent);
                }
                return { "width": nW, "height": nH, "top": top, "left": left };
            },

            disableZoom: function () {
                var self = this;
                self.$imgNative.unbind('mousedown mouseup');
                self.$imgNative.css({
                    "width": self.$divNative.width(),
                    "height": self.$divNative.height(),
                    "top": 0,
                    "left": 0,
                    "cursor": "default"
                });
            },

            resize: function () {
                var self = this;
                self.nativeWidth = self.$imgNative.width();
                self.nativeHeight = self.$imgNative.height();
                self.addbindEvent();
            },

            //#region 无插件做法
            addScrollListener: function (element, wheelHandle) {
                var self = this;
                if (typeof wheelHandle != "function") return;
                if (typeof element != "object") return;
                //监听浏览器
                if (typeof arguments.callee.browser == "undefined") {
                    var user = navigator.userAgent;
                    var b = {};
                    b.opera = user.indexOf("Opera") > -1 && window.Opera == "object";
                    b.khtml = user.indexOf("KHTML") > -1 ||
                        user.indexOf("Konqueror") > -1 ||
                        user.indexOf("AppleWebkit") > -1 && !b.opera;
                    b.ie = user.indexOf("MSIE") > -1 && !b.opera;
                    b.gecko = user.indexOf("Gecko") > -1 && !b.khtml;
                    arguments.callee.browser = b;
                }
                if (element == window) {
                    element = self.$divNative.get(0);
                    if (arguments.callee.browser.ie) {
                        element.attachEvent("onmousewheel", wheelHandle);
                    }
                    else
                        element.addEventListener(arguments.callee.browser.gecko ? "DOMMouseScroll" : "mousewheel", wheelHandle, false);
                }
            },

            wheelHandle: function (e) {
                var self = this;
                var w = self.$imgNative.width();
                var h = self.$imgNative.height();
                var data = null;
                if (e.wheelDelta) {
                    if (e.wheelDelta > 0)
                        data = self.loadEvent("*");
                    else
                        data = self.loadEvent("/");
                }
                else {
                    if (e.detail < 0)
                        data = self.loadEvent("*");
                    else
                        data = self.loadEvent("/");
                }
                if (data == null)
                    return;
                self.$imgNative.width(data.width).height(data.height).css({ "top": data.top, "left": data.left });
            }
            //#endregion
        };
        return Image;
    });