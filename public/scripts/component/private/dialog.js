define(['mustache','jquery'],function(mustache){
    
    var dialogTpl = '<div class="page-dialog-wrapper"><div class="page-dialog {{type}}"><div class="title"><span class="text">{{title}}</span></div><div class="cont"><p class="detail"><span class="icon"></span><span class="text">{{{content}}}</span></p><div class="operation">{{#hasConfirmBtn}}<a class="btn confirm" href="javascript:;">确定</a>{{/hasConfirmBtn}}{{#hasCancelBtn}}<a class="btn secondary cancel" href="javascript:;">取消</a>{{/hasCancelBtn}}</div></div></div></div>';

    function Dialog(opt){
        this.init(opt);
    }

    Dialog.prototype = {
        init:function(opt){
            var self = this;
            
            self.config(opt);
            self.create();
        },
        config:function(opt){
            var self = this;

            self.types = ['info','error','ok','warn'];
            
            self.data = {};
            self.data.type = typeof opt.type === 'string' ? opt.type : 'info';
            self.data.title = (function(optTitle){
                var title;
                if(typeof optTitle === 'string' && optTitle !== ''){
                    title = optTitle;
                }else{
                    switch(self.type){
                        case 'ok':
                            title = '成功';
                            break;
                        case 'error':
                            title = '错误';
                            break;
                        case 'warn':
                            title = '警告';
                            break;
                        default :
                            title = '信息';
                    }
                }
                return title;
            })(opt.title);
            self.data.content = typeof opt.content === 'string' ? opt.content : '来自页面的信息';
            
            self.callback = {};
            self.callback.confirm = typeof opt.onConfirm  === 'function' ? opt.onConfirm : function(){};
            self.callback.cancel = typeof opt.onCancel  === 'function' ? opt.onCancel : function(){};
            
            self.data.hasConfirmBtn = typeof opt.confirmBtn  === 'boolean' ? opt.confirmBtn : true;
            self.data.hasCancelBtn = typeof opt.cancelBtn  === 'boolean' ? opt.cancelBtn : false;
        },
        create:function(){
            var self = this;

            self.dialog = $(mustache.render(dialogTpl,self.data));
            $('body').append(self.dialog);


            //style fix
            var $dialog = self.dialog.find('.page-dialog');
            $dialog.css({
                marginTop: -($dialog.outerHeight() / 2),
                marginLeft: -($dialog.outerWidth() / 2)
            });
            
            self.dialog.on('click','.operation .confirm',function(){
                self.dialog.remove();
                self.callback.confirm();
            });
            self.dialog.on('click','.operation .cancel',function(){
                self.dialog.remove();
                self.callback.cancel();
            });

            self.dialog.find('.operation .confirm').focus();
            self.dialog.find('.operation .confirm').blur();
        }
    };

    return Dialog;
});