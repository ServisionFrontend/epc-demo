(function($) {

	function debounce(fun, wait, immediate) {
		var timer;
		return function() {
			var args = arguments, context = this,
				later = function() {
					timer = null;

					if(!immediate) {
						fun.apply(context || this, args);
					}
				};
			var callNow = !timer && immediate;
			clearTimeout(timer);
			if(callNow) {
				fun.apply(context || this, args);
				return;
			}
			timer = setTimeout(later, wait);
		}
	};

	$.extend({

		getParameterByName: function(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.search);
			if (results == null)
				return "";
			else
				return decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		showBlockUI: function(params) {
			var name = params.name,
				el = params.message,
				defaultConfig = {
					message: el,
					fadeIn: 0,
					fadeOut: 0,
					focusInput: false,
					css: {
						cursor: 'default',
						textAlign: 'left',
						border: 'none'
					},
					onBlock: function () {
						if(params.onBlock) {
							callbacks.onBlock.apply(null, []);
						}
					},
					onUnblock: function () {
						if(params.onUnblock) {
							callbacks.onUnblock.apply(null, []);
						}
					},
					onOverlayClick: function () {
						if(params.onOverlayClick) {
							callbacks.onOverlayClick.apply(null, []);
						}
					}
				},
				config;

			if(typeof el === 'string') {
				config = $.extend(true, {}, defaultConfig, params);

				!params.parent ? $.blockUI(config) : params.parent.block(config);
				return;
			}

			config = $.extend(true, {}, defaultConfig, {
				css: {
					width: el.outerWidth(),
					height: el.outerHeight(),
					left: ($(window).width() - el.outerWidth()) / 2,
					top: ($(window).height() - el.outerHeight()) / 2,
					border: 'none',
					cursor: 'default',
					textAlign: 'left',
					zIndex: 500
				},					
				overlayCSS: {
					cursor: 'default',
					zIndex: '499'
				},
				baseZ: 497
			}, params);

			$(window).on('resize.' + params.name, debounce(function () {
				var $blockMsg = el.parent('.blockMsg');

				if(params.parent) {
					$blockMsg.css({
						left: ($blockMsg.parent().width() - el.outerWidth()) / 2,
						top: ($blockMsg.parent().height() - el.outerHeight()) / 2
					});
					return;
				}
				$blockMsg.css({
					left: ($(window).width() - el.outerWidth()) / 2,
					top: ($(window).height() - el.outerHeight()) / 2
				})
			}, 200));

			$(document).on('keyup.' + params.name, function(e) {
				if (e.keyCode === 27) {
					$.hideBlockUI(config);
				}
			});

			if(el.find('.layer-close-btn') && el.find('.layer-close-btn').length > 0) {
				el.find('.layer-close-btn').on('click', function() {
					$.hideBlockUI(config);
				});
			}

			!params.parent ? $.blockUI(config) : params.parent.block(config);
		},

		hideBlockUI: function(params) {

			if (params.name) {
				$(document).off('keyup.' + params.name);
				$(window).off('resize.' + params.name);
			}
			if (typeof params.message !== 'string' && params.message.find('.layer-close-btn').length > 0) {
				params.message.find('.layer-close-btn').off('click');
			}

			!params.parent ? $.unblockUI(params) : params.parent.unblock(params);
		},

		showTips: function (type, message) {
			var types = ['warn', 'ok', 'error', 'info', 'hide'],
				$el = $('#page-tips'),
				time = time || 3000;

			for(var i = 0; i < types.length; i++) {
				$el.removeClass(types[i]);
			}
			$el.addClass(type).find('.text').text(message);
		},

		hideTips: function () {
			var $el = $('#page-tips');

			$el.addClass('hide');
		}

	});

	$.fn.extend({
		fillElByField: function(data) {

			this.find("input,select,a,span,div,textarea").each(function(index, element) {
				var type, key = $(element).attr("data-field");
				if (key === undefined)
					return;
				var tagN = element.tagName.toUpperCase();
				if (tagN === "INPUT") {
					type = $(element).attr("type");

					switch (type) {
						case "text":
							$(element).val(data[key]);
							break;
						case "checkbox":
							$(element).attr("checked", data[key]);
							break;
						case "hidden":
							$(element).val(data[key]);
							break;
						default:
							break;
					}
				} else if (tagN == "SELECT") {
					$(element).val(data[key]);
				} else if (tagN == "A") {
					$(element).text(data[key]);
				} else if (tagN == "DIV" || element.tagName == "SPAN") {
					$(element).html(data[key]);
				} else if (tagN == "TEXTAREA") {
					$(element).text(data[key]);
				}

			});
		},

		// return selected object list
		selectElByField: function() {

			var resultObj = {};
			this.find("input,select,a,span,div,textarea").each(function(index, element) {
				var type, key = $(element).attr("data-field");
				if (key === undefined)
					return;
				if (element.tagName == "INPUT") {
					type = $(element).attr("type");

					switch (type) {
						case "text":
						case "password":
						case "hidden":
							resultObj[key] = $(element).val();
							break;
						case "checkbox":
							resultObj[key] = $(element).is(":checked");
							break;
						default:
							break;
					}
				} else if (element.tagName == "SELECT") {
					if ($(element).val().length === 0)
						resultObj[key] = "";
					else
						resultObj[key] = $(element).val(); // { "text": $(element).find("option:selected").text(), "value": $(element).val() };
				} else if (element.tagName == "A") {
					resultObj[key] = $(element).html();
				} else if (element.tagName == "DIV" || element.tagName == "SPAN") {
					resultObj[key] = $(element).html();
				} else if (element.tagName == "TEXTAREA") {
					resultObj[key] = $(element).val() || $(element).text();
				}
			});
			return resultObj;
		},

		// return selected object list
		clearElByField: function() {

			this.find("input,select,a,span,div,textarea").each(function(index, element) {
				var type, key = $(element).attr("data-field");
				if (key === undefined)
					return;
				if (element.tagName == "INPUT") {
					type = $(element).attr("type");

					switch (type) {
						case "text":
						case "password":
						case "hidden":
							$(element).val("");
							break;
						case "checkbox":
							$(element).attr("checked", false);
							break;
						default:
							$(element).val("");
							break;
					}
				} else if (element.tagName == "SELECT") {
					$(element).val("");
				} else if (element.tagName == "DIV") {
					$(element).html("");
				} else if (element.tagName == "SPAN") {
					$(element).html("");
				} else if (element.tagName == "TEXTAREA") {
					$(element).text("").val("");
				}
			});
		},

		initPlaceholder: function(opts) {
			var defaults = {
				lfdistance: 10
			};

			defaults = $.extend({}, defaults, opts);
			if (!("placeholder" in document.createElement("input"))) {
				this.each(function(idx, val) {
					var $el = $(this),
						placeholder = $el.attr('placeholder'),
						_resetPlaceHolder = null,
						elId, $label;
					if (placeholder) {
						elId = $el.attr("id");
						if (!elId) {
							var now = new Date();
							elId = 'lbl_placeholder' + now.getSeconds() + now.getMilliseconds();
							$el.attr("id", elId);
						}
						$label = $('<label>', {
							html: $el.val() ? '' : placeholder,
							'for': elId,
							css: {
								position: 'absolute',
								left: $el.position().left + defaults.lfdistance,
								top: $el.position().top,
								height: $el.outerHeight(true),
								lineHeight: $el.outerHeight(true) + 'px',
								color: "#C3C3C3",
								cursor: 'text'
							}
						}).insertAfter($el);
						_resetPlaceHolder = function(e) {
							if ($el.val()) {
								$label.html('');
							} else
								$label.html(placeholder);
						};

						$el.on('focus blur input keyup propertychange', _resetPlaceHolder);
						_resetPlaceHolder();
					}

				});
			}
		}

	});

})(jQuery);