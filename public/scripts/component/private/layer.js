define(['jquery'], function () {

    function isInArr(value,arr){
        var result = false;
        var n = arr.length;
        for(var i=0;i<n;i++){
            if(value === arr[i]){
                result = true;
                break;
            }
        }
        return result;
    }

    function removeFromArr(value,arr){
        var index;
        var n = arr.length;
        for(var i=0;i<n;i++){
            if(value === arr[i]){
                index = i;
                break;
            }
        }
        if(typeof index === 'number'){
            arr.splice(index,1);
        }
    }

    //全局对象
    var layer = {
        ids:[],//所有已创建的层的id
        openIds:[],//打开着的层的id
        instances:{},//所有已创建的层
        currentId:null,//当前层的id
        minZIndex:5000,//弹层最小z-index
        pageCoverLayer:$('<div style="display:none;position:fixed;top:0px;left:0px;width:100%;height:100%;background:#000;opacity:.4;filter:alpha(opacity=40);"></div>'),
        setCurrent:function(id){
            var self = this;

            if(self.currentId === id){ return; }
            if(!isInArr(id,self.openIds)){ return; }

            var arr = [];
            var n = self.openIds.length;
            for(var i=0;i<n;i++){
                if(id !== self.openIds[i]){
                    arr.push(self.openIds[i]);
                }
            }
            arr.reverse();
            var x = arr.length;
            var m = self.minZIndex + n;
            self.instances[id].layer.css({zIndex: m});
            m--;
            if(self.instances[id].lockPage){
                self.pageCoverLayer.css({zIndex: m});
                m--;
            }
            for(var j=0;j<x;j++){
                self.instances[arr[j]].layer.css({zIndex: m});
                m--
            }

            self.currentId = id;
        },//设置为当前层(前提是此层是开着的)
        open:function(id){
            var self = this;

            if(!isInArr(id,self.ids)){
                try{ console.log('要打开的层不存在'); }catch(e){}
                return;
            }
            var layerELement = self.instances[id].layer;
            var lockPage = self.instances[id].lockPage;

            if(self.pageCoverLayer.parents('body').size() === 0 && lockPage){
                $('body').append(self.pageCoverLayer);
                self.pageCoverLayer.show();
            }

            if(!isInArr(id,self.openIds)){
                $('body').append(layerELement);
                try{var tmpHeight = layerELement.outerHeight()}catch(e){};//IE8 bug fixed
                layerELement.css({
                    marginTop: -(layerELement.outerHeight() / 2),
                    marginLeft: -(layerELement.outerWidth() / 2)
                });
                layerELement.fadeIn();
                self.openIds.push(id);
            }
            
            self.setCurrent(id);
        },//打开一个层（前提是此层已创建,如果未打开则打开后设为当前层，如果已打开则直接设为当前层）
        close:function(id){
            var self = this;

            if(!isInArr(id,self.ids)){
                try{ console.log('要关闭的层不存在'); }catch(e){}
                return;
            }

            var layerELement = self.instances[id].layer;
            $('body')[0].removeChild(layerELement[0]);
            layerELement = null;

            removeFromArr(id,self.openIds);
            removeFromArr(id,self.ids);
            delete(self.instances[id]);

            if(self.openIds.length === 0){
                if(self.pageCoverLayer.parents('body').size() > 0){
                    self.pageCoverLayer.hide();
                    $('body')[0].removeChild(self.pageCoverLayer[0]);//移除覆盖层
                }
                //$(document).off('keyup.closelayer');//移除keyup事件
                self.currentId = null;
            }else{
                self.setCurrent(self.openIds[self.openIds.length - 1]);
            }
        },//关闭一个层（前提是此层是开着的）
        closeAll:function(bool){},//关闭所有已打开的层
        destory:function(id){},//销毁一个层（前提是这个层时关闭着的）
        destoryAll:function(id){},//销毁所有已关闭的层
        create:function(opt){
            var layerId = typeof opt.name === 'string' ? opt.name : (new Date()).getTime()+(Math.random()*1000).toFixed(0);//给创建的弹层指定layerId
            //判断当前id是否已存在
            if(isInArr(layerId,layer.ids)){
                return layer.instances[layerId];
            }else{
                //判断必备选项是否符合要求
                if(typeof opt.layerHtml !== 'string' || $.trim(opt.layerHtml) === ''){
                    try{ console.log('创建选项存不符合要求，创建失败！') }catch(e){};
                    return null;
                }else{
                    opt.id = layerId;
                    return new Layer(opt);
                }
            }
        }
    };

    //esc键退出当前层
    $(document).on('keyup.closelayer',function(e){
        if(e.keyCode == 27){
            if(layer.currentId !== null && layer.instances[layer.currentId].escKey){
                layer.instances[layer.currentId].close();
            }
        }
    });


    /*opt = {
        name:'',//js变量命名规则(指定命名时该层只能同时存在一个) 此name将会被作为实例的id，默认自动生成
        layerHtml:'',//完整的html元素的HTML代码 --必填项
        closeBtnSelector:'',//关闭按钮的jquery选择器 默认为'.layer-close-btn'
        lockPage:true,//是否锁定页面（遮罩层）默认锁定
        escKey:true,//是否可以使用esc退出，默认可以
        parentId:'',//父层的layerId  默认为null
        beforeOpen:[function],//打开前的回调 返回值为true可执行打开 为false则阻止打开
        afterOpen:[function],//打开后的回调
        beforeClose:[function],//关闭前的回调 返回值为true可执行关闭 为false则阻止关闭
        afterClose:[function]//关闭后的回调
    };*/


    //构造函数
    function Layer(opt){
        this.init(opt);
    }
    Layer.prototype = {
        init:function(opt){
            var self = this;
            self.config(opt);
            self.create();
        },
        config: function (opt) {
            var self = this;

            self.layerHtml = opt.layerHtml;
            self.closeBtnSelector = opt.closeBtnSelector || '.layer-close-btn';
            self.beforeOpen = opt.beforeOpen || function () { return true; };
            self.afterOpen = opt.afterOpen || function () { };
            self.beforeClose = opt.beforeClose || function () { return true; };
            self.afterClose = opt.afterClose || function () { };
            self.id = opt.id;
            if(typeof opt.parentId === 'string'){
                if(isInArr(opt.parentId,layer.ids)){
                    self.pid = opt.parentId;
                }else{
                    try{ console.log('指定的父层id无效!'); }catch(e){};
                    self.pid = null;
                }
            }else{
                self.pid = null;
            }
            self.escKey = typeof opt.escKey === 'boolean' ?  opt.escKey : true;
            self.lockPage = typeof opt.lockPage === 'boolean' ? opt.lockPage : true;     
        },
        create: function (opt) {
            var self = this;
            
            //生成dom元素
            self.layer = $(self.layerHtml);

            //初步处理样式
            self.layer.css({
                position: 'fixed',
                top:'50%',
                left: '50%'
            });
            
            //绑定事件
            self.bindEvent();

            //将信息同步到全局对象中
            layer.ids.push(self.id);
            layer.instances[self.id] = self;   
        },

        open: function () {
            var self = this;

            //如果层已打开
            if(isInArr(self.id,layer.openIds)){
                return;
            }

            if (!self.beforeOpen()){ return; }
            layer.open(self.id);
            self.afterOpen();
        },

        close: function () {
            var self = this;

            if (!self.beforeClose()){ return; }
            layer.close(self.id);
            self.afterClose();
        },

        styleFix:function(){
            var self = this;

            self.layer.css({
                marginTop: -(self.layer.outerHeight() / 2),
                marginLeft: -(self.layer.outerWidth() / 2)
            });
        },

        bindEvent: function () {
            var self = this;

            self.closeBtn = self.layer.find(self.closeBtnSelector);
            if(self.closeBtn.size() > 0){
                self.closeBtn.on('click', function(e){
                    self.close();
                    e.preventDefault();
                });
            }
        }
    };

    return layer;
});