define(['jquery'], function (jQuery){
//自定义配置
var options = {
	selectClass:'form-select',
	selectInputClass:'form-select-input',
	selectTextClass:'form-select-text',
	selectOptionClass:'form-select-option',
	selectOptionListClass:'form-select-option-list',
	selectSwitchBtnClass:'form-select-switch-btn',
	disbaleClass:'disabled',//html中需要给form_select_switch_btn元素添加 tabindex="-1"
	currentOptionClass:'currentOption',//默认选中的选项添加currentOption的class，同时让form_select_text的text和form_select_input的alue与之对应
	optionValueAttr:'data-value'
};

(function($,opt){
	//默认配置
	var selectClass = opt.selectClass || 'form-select',
		selectInputClass = opt.selectInputClass || 'form-select-input',
		selectTextClass = opt.selectTextClass || 'form-select-text',
		selectOptionClass = opt.selectOptionClass || 'form-select-option',
		selectOptionListClass = opt.selectOptionListClass || 'form-select-option-list',
		selectSwitchBtnClass = opt.selectSwitchBtnClass || 'form-select-switch-btn',

		disbaleClass = opt.disbaleClass || 'disabled',//select元素不可用时的class
		currentOptionClass = opt.currentOptionClass || 'currentOption',
		optionValueAttr = opt.optionValueAttr || 'data-value';

	var selectSelector = '.' + selectClass,
		selectInputSelector = '.' + selectInputClass,
		selectTextSelector = '.' + selectTextClass,
		selectOptionSelector = '.' + selectOptionClass,
		selectOptionListSelector = '.' + selectOptionListClass,
		selectSwitchBtnSelector = '.' + selectSwitchBtnClass,

		currentOptionSelector = '.' + currentOptionClass;

	//打开选项
	function showOptions(ele){
		var $optionList = ele.find(selectOptionListSelector);
		if($optionList.eq(0).find(selectOptionSelector).size() === 0){
			return;//没有选项直接返回
		}
		$optionList.eq(0).show();//显示选项
		//当前值高亮
		var currentValue = getValueInfo(ele).value;
		ele.find(selectOptionSelector).each(function(){
			var $thisOption = $(this);
			$thisOption.removeClass(currentOptionClass);
			if ($thisOption.attr(optionValueAttr) === currentValue){
				$thisOption.addClass(currentOptionClass);
			}
		});
	}

	//关闭选项
	function hideOptions(ele){
		ele.find(selectOptionListSelector).eq(0).hide();
	}

	//获取当前select的值信息
	function getValueInfo(ele){
		return {value:ele.find(selectInputSelector).val(),text:ele.find(selectTextSelector).text()};
	}

	function getCurrentOptinIndex(ele){
		var currentValue = getValueInfo(ele).value,
			currentIndex;
		ele.find(selectOptionSelector).each(function(index){
			if($(this).attr(optionValueAttr) === currentValue){
				currentIndex = index;
				return false;
			}
		});
		return currentIndex;
	}



	function setCurrentOption(ele,index){
		var $thisOptions = ele.find(selectOptionSelector);
		$thisOptions.removeClass(currentOptionClass)
		$thisOptions.eq(index).addClass(currentOptionClass);
	}

	//设置当前select的值
	function setValue(ele,value,text){
		ele.find(selectInputSelector).val(value).end().find(selectTextSelector).text(text).attr('title',text);
		setCurrentOption(ele,getCurrentOptinIndex(ele));
		//接口 - 值改变时
		/*if(typeof ele[0].onChangeSelectValue == 'function'){
			try{ele[0].onChangeSelectValue()}catch(e){}	
		}*/
		ele.trigger('evtChange');
	}

	function isDisabled(ele){
		if(ele.hasClass(disbaleClass)){
			return true;
		}
		return false;
	}

	function getKeyString(keycode,shiftkey){
		var keyCodeArr = [{str:"0",shiftStr:')',code:48},{str:"1",shiftStr:'!',code:49},{str:"2",shiftStr:'@',code:50},{str:"3",shiftStr:'#',code:51},{str:"4",shiftStr:'$',code:52},{str:"5",shiftStr:'%',code:53},{str:"6",shiftStr:'^',code:54},{str:"7",shiftStr:'&',code:55},{str:"8",shiftStr:'*',code:56},{str:"9",shiftStr:'(',code:57},{str:"a",shiftStr:'A',code:65},{str:"b",shiftStr:'B',code:66},{str:"c",shiftStr:'C',code:67},{str:"d",shiftStr:'D',code:68},{str:"e",shiftStr:'E',code:69},{str:"f",shiftStr:'F',code:70},{str:"g",shiftStr:'G',code:71},{str:"h",shiftStr:'H',code:72},{str:"i",shiftStr:'I',code:73},{str:"j",shiftStr:'J',code:74},{str:"k",shiftStr:'K',code:75},{str:"l",shiftStr:'L',code:76},{str:"m",shiftStr:'M',code:77},{str:"n",shiftStr:'N',code:78},{str:"o",shiftStr:'O',code:79},{str:"p",shiftStr:'P',code:80},{str:"q",shiftStr:'Q',code:81},{str:"r",shiftStr:'R',code:82},{str:"s",shiftStr:'S',code:83},{str:"t",shiftStr:'T',code:84},{str:"u",shiftStr:'U',code:85},{str:"v",shiftStr:'V',code:86},{str:"w",shiftStr:'W',code:87},{str:"x",shiftStr:'X',code:88},{str:"y",shiftStr:'Y',code:89},{str:"z",shiftStr:'Z',code:90}];
			n = keyCodeArr.length,
			index = -1;
		for(var i=0;i<n;i++){
			if(keyCodeArr[i].code === keycode){
				index = i;
			}
		}
		if(index === -1){
			return '';
		}else{
			if(shiftkey){
				return keyCodeArr[index].shiftStr;
			}
			return keyCodeArr[index].str;
		}
	}

	function scrollToCurrentOption(ele,index){
		var $thisOptionList = ele.find(selectOptionListSelector),
			$thisOptions = ele.find(selectOptionSelector),
			$currentOption = $thisOptions.eq(index);
			//$currentOptionTop = $thisOptionList.scrollTop() + $currentOption.position().top;
			if($currentOption.position().top <= 0){
				$thisOptionList.scrollTop($thisOptionList.scrollTop() + $currentOption.position().top);
			}else{
				$thisOptionList.scrollTop($thisOptionList.scrollTop() + $currentOption.position().top + $currentOption.outerHeight() - $thisOptionList.height());
			}
	}

	//设置焦点
	$(document).on('click',selectSelector,function(){
		var $thisSelect = $(this);
		if(isDisabled($thisSelect)){ 
			$thisSelect.find(selectSwitchBtnSelector).blur()
			return;
		};
		$thisSelect.find(selectSwitchBtnSelector).focus();
	});
	//选项开关
	$(document).on('click',selectSwitchBtnSelector,function(e){
		$thisSelect = $(this).parents(selectSelector);
		if(isDisabled($thisSelect)){ return };
		if($thisSelect.find(selectOptionListSelector).is(':hidden')){
			showOptions($thisSelect);
		}else{
			hideOptions($thisSelect);
		}
		e.preventDefault();
	});
	//失去焦点时隐藏选项列表
	$(document).on('click',function(e){
		var $thisSelect;
		if($(e.target).parents(selectSelector).size()>0){
			$thisSelect = $(e.target).parents(selectSelector);
		}else if($(e.target).hasClass(selectSelector)){
			$thisSelect = $(e.target);
		}
		$(selectSelector).each(function(){
			var $this = $(this);
			if($thisSelect){
				if($this[0] === $thisSelect[0]){
					return;
				}
			}
			hideOptions($this);
		});
	});
	//鼠标hover option
	$(document).on("mouseenter",selectSelector+' '+selectOptionSelector,function(){
		var $thisOption = $(this),
			$thisSelect = $thisOption.parents(selectSelector),
			$thisOptions = $thisSelect.find(selectOptionSelector);
		$thisOptions.removeClass(currentOptionClass);
		$thisOption.addClass(currentOptionClass);
	});

	//单击选值
	$(document).on("click",selectSelector+' '+selectOptionSelector,function(){
		var $thisOption = $(this),
			$thisSelect = $thisOption.parents(selectSelector),
			newText = $thisOption.text(),
			newValue = $thisOption.attr(optionValueAttr);
		setValue($thisSelect,newValue,newText);
		hideOptions($thisSelect);
	});

	//键盘操作
	$(document).on("keydown",function(e){
		var $thisSelect,
			currentValue,
			$currentOption,
			currentIndex,
			$thisOptions,
			thisOptionsSize,
			newCurrentIndex,
			keyString,
			matchedOptions = [],
			matchedOptionsSize = 0,
			currentMatchedIndex = -1,
			$activeEle = $(document.activeElement);
		if($activeEle.parents(selectSelector).size()>0){
			$thisSelect = $activeEle.parents(selectSelector);
			if(isDisabled($thisSelect)){ return };
			$thisOptions = $thisSelect.find(selectOptionSelector);
			thisOptionsSize = $thisOptions.size();
			$currentOption = $thisSelect.find(currentOptionSelector);
			currentIndex = $currentOption.index();

			//输入匹配
			if((e.keyCode >= 48 && e.keyCode<=57)||(e.keyCode >= 65 && e.keyCode<=90)){
				keyString = getKeyString(e.keyCode,e.shiftKey);
				$thisOptions.each(function(index){
					var $this = $(this),
						thisText = $this.text(),
						thisValue = $this.attr(optionValueAttr)
					if(thisText[0] === keyString){
						matchedOptions.push({value:thisValue,text:thisText,index:index});
					}
				});
				matchedOptionsSize = matchedOptions.length;
				if(matchedOptionsSize === 0){
					return;
				}
				currentValue = getValueInfo($thisSelect).value;
				for(var i=0;i<matchedOptionsSize;i++){
					if(matchedOptions[i].value === currentValue){
						currentMatchedIndex = i;
					}
				}
				if(currentMatchedIndex !== -1){
					if(currentMatchedIndex == matchedOptionsSize - 1){
						newCurrentIndex = matchedOptions[0].index;
					}else{
						newCurrentIndex = matchedOptions[currentMatchedIndex + 1].index;
					}
				}else{
					newCurrentIndex = matchedOptions[0].index;
				}
				setValue($thisSelect,$thisOptions.eq(newCurrentIndex).attr(optionValueAttr),$thisOptions.eq(newCurrentIndex).text());
				scrollToCurrentOption($thisSelect,newCurrentIndex);
			}

			//上下方向键选值
			if(e.keyCode == 38 || e.keyCode == 40 ){
				
				if(e.keyCode == 38){
					if(currentIndex === -1){
						newCurrentIndex = thisOptionsSize -1;
					}else{
						if(currentIndex != 0){
							newCurrentIndex = currentIndex - 1;
						}else{
							newCurrentIndex = thisOptionsSize - 1;//开启循环1
							//return;//关闭循环1
						}
					}
							
				};
				if(e.keyCode == 40){
					if(currentIndex === -1){
						newCurrentIndex = 0;
					}else{
						if(currentIndex != thisOptionsSize - 1){
							newCurrentIndex = currentIndex + 1;
						}else{
							newCurrentIndex = 0;//开启循环2
							//return;//关闭循环2
						}
					}
					
				};
				setValue($thisSelect,$thisOptions.eq(newCurrentIndex).attr(optionValueAttr),$thisOptions.eq(newCurrentIndex).text());
				scrollToCurrentOption($thisSelect,newCurrentIndex);
				e.preventDefault();
			}

			//enter键确认选值
			if(e.keyCode == 13){
				if($currentOption.size() > 0){
					setValue($thisSelect,$currentOption.attr(optionValueAttr),$currentOption.text());
				}
			}
		};
		
	});

})(jQuery,options);
});