(function($){
	$.fn.extend({
		getFormValue: function(keyAttribute) {
			var resultObject = {};
			var keyAttribute = keyAttribute || 'name';
			this.find('input,select,textarea').each(function(index, element) {
				var $element = $(element),
					key = $element.attr(keyAttribute),
					type = $element.attr('type'),
					isNeedEncode = $element.attr('data-encode'),
					tagName = element.tagName.toUpperCase();

				if(!key) {return;}
				if(tagName === 'INPUT') {
					switch(type) {
						case 'hidden':
						case 'text': 
							resultObject[key] = isNeedEncode ? htmlEncode($element.val()) : $element.val();
							break;
						case 'checkbox':
							if($element.is(':checked')) {
								resultObject[key] = resultObject[key] || [];
								resultObject[key].push($element.val());
							}
							
							break;
						case 'radio':
							if($element.is(':checked')) {
								resultObject[key] = $element.val();
							}
							break;
						default:
							break;
					}
				}
				if(tagName === 'SELECT' || tagName === 'TEXTAREA') {
					resultObject[key] = isNeedEncode ? htmlEncode($element.val()) : $element.val();
				}
			})
			return resultObject;
		},

		setFormValue: function(formValue,keyAttribute) {
			var keyAttribute = keyAttribute || 'name';

			for(var key in formValue) {
				var $dom = $('['+keyAttribute+'='+key+']');
				$dom.val(formValue[key]);
			}
		},

		verifyIsNull: function() {
			var self = this;

			var needVerifyInput = this.find('input,textarea').not('.hide').filter('[data-null="false"]'),
				result = true;
			needVerifyInput.each(function(index,element) {

				var val = $.trim($(element).val());
				if(!val || val.length === 0) {
					result = false;
					return;
				}
			});
			return result;
		}

	});
})(jQuery);