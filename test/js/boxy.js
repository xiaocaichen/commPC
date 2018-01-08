/**
 * Boxy 0.1.4 - Facebook-style dialog, with frills
 *
 * (c) 2008 Jason Frame
 * Licensed under the MIT License (LICENSE)
 */
 
/*
 * jQuery plugin
 *
 * Options:
 *   message: confirmation message for form submit hook (default: "Please confirm:")
 * 
 * Any other options - e.g. 'clone' - will be passed onto the boxy constructor (or
 * Boxy.load for AJAX operations)
 */
//$(".boxy-wrapper").hide();删除打开的窗口
jQuery.fn.boxy = function(options) {
    options = options || {};
    return this.each(function() {      
        var node = this.nodeName.toLowerCase(), self = this;
        if (node == 'a') {
            jQuery(this).click(function() {
                var active = Boxy.linkedTo(this),
                    href = this.getAttribute('href'),
                    localOptions = jQuery.extend({actuator: this, title: this.title}, options);
                    
                if (active) {
                    active.show();
                } else if (href.indexOf('#') >= 0) {
                    var content = jQuery(href.substr(href.indexOf('#'))),
                        newContent = content.clone(true);
                    content.remove();
                    localOptions.unloadOnHide = false;
                    new Boxy(newContent, localOptions);
                } else { // fall back to AJAX; could do with a same-origin check
                    if (!localOptions.cache) localOptions.unloadOnHide = true;
                    Boxy.load(this.href, localOptions);
                }
                
                return false;
            });
        } else if (node == 'form') {
            jQuery(this).bind('submit.boxy', function() {
                Boxy.confirm(options.message || '请确认：', function() {
                    jQuery(self).unbind('submit.boxy').submit();
                });
                return false;
            });
        }
    });
};

//
// Boxy Class

function Boxy(element, options) {
    
    this.boxy = jQuery(Boxy.WRAPPER);
    jQuery.data(this.boxy[0], 'boxy', this);
    
    this.visible = false;
    this.options = jQuery.extend({}, Boxy.DEFAULTS, options || {});
    
    if (this.options.modal) {
        this.options = jQuery.extend(this.options, {center: true, draggable: false});
    }
    
    // options.actuator == DOM element that opened this boxy
    // association will be automatically deleted when this boxy is remove()d
    if (this.options.actuator) {
        jQuery.data(this.options.actuator, 'active.boxy', this);
    }
    
    this.setContent(element || "<div></div>");
    this._setupTitleBar();
    
    this.boxy.css('display', 'none').appendTo(document.body);
    this.toTop();

    if (this.options.fixed) {
        if (jQuery.browser.msie && jQuery.browser.version < 7) {
            this.options.fixed = false; // IE6 doesn't support fixed positioning
        } else {
            this.boxy.addClass('fixed');
        }
    }
    
    if (this.options.center && Boxy._u(this.options.x, this.options.y)) {
        this.center();
    } else {
        this.moveTo(
            Boxy._u(this.options.x) ? this.options.x : Boxy.DEFAULT_X,
            Boxy._u(this.options.y) ? this.options.y : Boxy.DEFAULT_Y
        );
    }
    
    if (this.options.show) this.show();


    //定时关闭和提示位置
    if (this.options.timeOutofClose)
    {
        var self=this.boxy;
        setTimeout(function(){
            self.stop().animate({
                opacity: 0
            }, 300,function(){self.remove();$(".boxy-modal-blackout").remove();});
        },this.options.timeOutofClose);
    }
    if(this.options.tipPos){
        if(!(this.options.tipPos instanceof jQuery))
            this.options.tipPos=this.options.tipPos.toUpperCase();
        var v=Boxy._viewport();
        var o = this.options.fixed ? [0, 0] : [v.left, v.top];
        var s=this.getSize();
        switch(this.options.tipPos){
            case "TOP":
                this.moveToY(o[1]);
                break;
            case "LEFT":
                this.moveToX(o[0]);
                break;
            case "TOP-LEFT":
                this.moveTo(o[0],o[1]);
                break;
            case "TOP-RIGHT":
                this.moveTo(v.width-o[0]-s[0],o[1]);
                break;
            case "RIGHT":
                this.moveToX(v.width-o[0]-s[0]);
                break;
            case "BOTTOM":
                this.moveToY(v.height-o[1]-s[1]);
                break;
            case "BOTTOM-LEFT":
                this.moveTo(o[0],v.height-o[1]-s[1]);
                break;
            case "BOTTOM-RIGHT":
                this.moveTo(v.width-o[0]-s[0],v.height-o[1]-s[1]);
                break;
            default:
                if(this.options.tipPos instanceof jQuery)
                {
                    //
                    this.moveTo(this.options.tipPos.offset().left,this.options.tipPos.offset().top);
                }
        }
    }

};

Boxy.EF = function() {};

jQuery.extend(Boxy, {
    
    WRAPPER:   "<table cellspacing='0' cellpadding='0' border='0' class='boxy-wrapper'>" +
//                   "<tr>" +
//                        "<td class='top-left'></td>" +
//                        "<td class='top'></td>" +
//                        "<td class='top-right'></td>" +
//                   "</tr>" +
                   "<tr>" +
                       // "<td class='left'></td>" +
                        "<td class='boxy-inner'></td>" +
                       // "<td class='right'></td>" +
                   "</tr>" +
//                   "<tr>" +
//                        "<td class='bottom-left'></td>" +
//                        "<td class='bottom'></td>" +
//                        "<td class='bottom-right'></td>" +
//                   "</tr>" +
                "</table>",
    
    DEFAULTS: {
        title:                  null,           // titlebar text. titlebar will not be visible if not set.
        closeable:              true,           // display close link in titlebar?
        draggable:              true,           // can this dialog be dragged?
        clone:                  false,          // clone content prior to insertion into dialog?
        actuator:               null,           // element which opened this dialog
        center:                 true,           // center dialog in viewport?
        show:                   true,           // show dialog immediately?
        modal:                  true,          // make dialog modal?
        visibility:false, //背景是否为透明
        maxWidth: 0, //自加 最大宽度
        timeOutofClose: 0, //自加 自动关闭 时间
        tipPos:false,//提示的位置
        fixed:                  true,           // use fixed positioning, if supported? absolute positioning used otherwise
        closeText:              '[关闭]',      // text to use for default close link
        unloadOnHide:           true,          // should this dialog be removed from the DOM after being hidden?
        clickToFront:           false,          // bring dialog to foreground on any click (not just titlebar)?
        behaviours:             Boxy.EF,        // function used to apply behaviours to all content embedded in dialog.
        afterDrop:              Boxy.EF,        // callback fired after dialog is dropped. executes in context of Boxy instance.
        afterShow:              Boxy.EF,        // callback fired after dialog becomes visible. executes in context of Boxy instance.
        afterHide:              Boxy.EF,        // callback fired after dialog is hidden. executed in context of Boxy instance.
        beforeUnload:           Boxy.EF         // callback fired after dialog is unloaded. executed in context of Boxy instance.
    },
    
    DEFAULT_X:          50,
    DEFAULT_Y:          50,
    zIndex:             1337,
    dragConfigured:     false, // only set up one drag handler for all boxys
    resizeConfigured:   false,
    dragging:           null,
    
    // load a URL and display in boxy
    // url - url to load
    // options keys (any not listed below are passed to boxy constructor)
    //   type: HTTP method, default: GET
    //   cache: cache retrieved content? default: false
    //   filter: jQuery selector used to filter remote content
    load: function(url, options) {

        options = options || {};

        var ajax = {
            url: url, type: 'GET', dataType: 'html', cache: false, success: function(html) {
                html = jQuery(html);
                if (options.filter) html = jQuery(options.filter, html);
                new Boxy(html, options);
            }
        };

        jQuery.each(['type', 'cache'], function() {
            if (this in options) {
                ajax[this] = options[this];
                delete options[this];
            }
        });

        jQuery.ajax(ajax);

    },

    // allows you to get a handle to the containing boxy instance of any element
    // e.g. <a href='#' onclick='alert(Boxy.get(this));'>inspect!</a>.
    // this returns the actual instance of the boxy 'class', not just a DOM element.
    // Boxy.get(this).hide() would be valid, for instance.
    get: function(ele) {
        var p = jQuery(ele).parents('.boxy-wrapper');
        return p.length ? jQuery.data(p[0], 'boxy') : null;
    },
    
    // returns the boxy instance which has been linked to a given element via the
    // 'actuator' constructor option.
    linkedTo: function(ele) {
        return jQuery.data(ele, 'active.boxy');
    },
    
    // displays an alert box with a given message, calling optional callback
    // after dismissal.
    alert: function(message, callback, options) {
        return Boxy.alertAsk(message, ['确认'], callback, options);
    },
    alertAsk: function(question, answers, callback, options) {
        options = jQuery.extend({modal: true, closeable: false},
            options || {},
            {show: true, unloadOnHide: true});
        var body = jQuery('<div></div>')
        if(question.length<=10){
            var p = jQuery('<div></div>').append(jQuery('<div class="alertMsg" style="height:60px;"></div>').html("<div class='alertMsgCon'>"+question+"</div>"));

        }else if(question.length>10&&question.length<24){
            var p = jQuery('<div></div>').append(jQuery('<div class="alertMsg" style="height:100px;"></div>').html("<div class='alertMsgCon'>"+question+"</div>"));
        }else{
            var p = jQuery('<div></div>').append(jQuery('<div class="alertMsg" style="height:120px;"></div>').html("<div class='alertMsgCon'>"+question+"</div>"));
        }
        body.append(p);
        // ick
        var map = {}, answerStrings = [];
        if (answers instanceof Array) {
            for (var i = 0; i < answers.length; i++) {
                map[answers[i]] = answers[i];
                answerStrings.push(answers[i]);
            }
        } else {
            for (var k in answers) {
                map[answers[k]] = k;
                answerStrings.push(answers[k]);
            }
        }
        var buttons = jQuery('<form class="askAlertAnswers"></form>');
        buttons.html(jQuery.map(answerStrings, function(v) {
            //add by zhangxinxu http://www.zhangxinxu.com 给确认对话框的确认取消按钮添加不同的class
            var btn_index;
            if(v === "确认"){
                btn_index = 1;
            }else if(v === "取消"){
                btn_index = 2;
            }else{
                btn_index = 3;
            }
            //add end.  include the 'btn_index' below
            return "<input class='' type='button' value='" + v + "' />";
        }).join(' '));
        jQuery('input[type=button]', buttons).click(function() {
            var clicked = this;
            Boxy.get(this).hide(function() {
                if (callback) callback(map[clicked.value]);
            });
        });
        body.append(buttons);
        new Boxy(body, options);
    },
    //错误提示信息
    tip: function(memssage, timeOut, pos){
        var body = jQuery('<div></div>');
        var p = jQuery("<div class='tipMsgCon'>"+memssage+"</div>");
        body.append(p);
        var self = this;
        var thisDlg;
        var options = jQuery.extend({
            modal: true,
            closeable: false,
            title: null
        }, options || {}, {
            show: true,
            unloadOnHide: true,
            timeOutofClose: timeOut,
            tipPos:pos
        });
        return new Boxy(body, options);


    },
    loading: function(message, callback, options) {
        return Boxy.loadingAsk(message, callback, options);
    },
    loadingAsk: function(question, callback, options) {
        options = jQuery.extend({modal: true, closeable: false},
            options || {},
            {show: true, unloadOnHide: true});
        var body = jQuery('<div style="background-color:#000;"></div>')
        body.append("<div class='loadImg'><img src='/public/common/loading.gif'></div><div class='loadCon'>"+question+"</div><div style='clear:both;'></div>");
        new Boxy(body, options);
    },

    // displays an alert box with a given message, calling after callback iff
    // user selects OK.
    confirm: function(message, after, options) {
        return Boxy.confirmAsk(message, ['确认', '取消'], function(response) {
            if (response == '确认') after();
        }, options);
    },
    confirmAsk: function(question, answers, callback, options) {
        options = jQuery.extend({modal: true, closeable: false},
            options || {},
            {show: true, unloadOnHide: true});
        var body = jQuery('<div></div>')
        var close= jQuery('<div class="confirmMsgClose"><img onclick="Boxy.get(this).hide();" src="/public/images/tan/true_close.png"/></div>');
        body.append(close);
        if(question.length<=10){
            var p = jQuery('<div></div>').append(jQuery('<div class="confirmMsg" style="height:60px;"></div>').html("<div class='confirmMsgImg'><img src='/public/images/tan/true.png'></div><div class='confirmMsgCon'>"+question+"</div>"));

        }else if(question.length>10&&question.length<24){
            var p = jQuery('<div></div>').append(jQuery('<div class="confirmMsg" style="height:100px;"></div>').html("<div class='confirmMsgImg'><img src='/public/images/tan/true.png'></div><div class='confirmMsgCon'>"+question+"</div>"));
        }else{
            var p = jQuery('<div></div>').append(jQuery('<div class="confirmMsg" style="height:120px;"></div>').html("<div class='confirmMsgImg'><img src='/public/images/tan/true.png'></div><div class='confirmMsgCon'>"+question+"</div>"));
        }
        body.append(p);
        // ick
        var map = {}, answerStrings = [];
        if (answers instanceof Array) {
            for (var i = 0; i < answers.length; i++) {
                map[answers[i]] = answers[i];
                answerStrings.push(answers[i]);
            }
        } else {
            for (var k in answers) {
                map[answers[k]] = k;
                answerStrings.push(answers[k]);
            }
        }
        var buttons = jQuery('<form class="askConfirmAnswers"></form>');
        buttons.html(jQuery.map(answerStrings, function(v) {
            //add by zhangxinxu http://www.zhangxinxu.com 给确认对话框的确认取消按钮添加不同的class
            var btn_index;
            if(v === "确认"){
                btn_index = 1;
                return "<input class='queren' type='button' value='" + v + "' />";
            }else if(v === "取消"){
                btn_index = 2;
                return "<input class='quxiao' type='button' value='" + v + "' />";
            }else{
                btn_index = 3;
            }

        }).join(' '));
        jQuery('input[type=button]', buttons).click(function() {
            var clicked = this;
            Boxy.get(this).hide(function() {
                if (callback) callback(map[clicked.value]);
            });
        });
        body.append(buttons);
        new Boxy(body, options);
    },
    button: function(message,answers,after1,after2,options) { //[msg,['button','url'],['button2','url']]自定义
        return Boxy.buttonAsk(message, answers, function(response) {
            if (response == answers[0]) after1();if (response == answers[1]) after2();
        }, options);
    },
    buttonAsk: function(question, answers, callback, options){
        options = jQuery.extend({modal: true, closeable: false},
            options || {},
            {show: true, unloadOnHide: true});
        var body = jQuery('<div style="background: #fff;"></div>')
        var p = jQuery('<div></div>').append(jQuery('<div class="confirmMsg" style="height:auto;"></div>').html("<div class='confirmMsgCon'>"+question+"</div>"));
       // body.append(p);
        // ick
        var map = {}, answerStrings = [];
        if (answers instanceof Array) {
            for (var i = 0; i < answers.length; i++) {
                map[answers[i]] = answers[i];
                answerStrings.push(answers[i]);
            }
        } else {
            for (var k in answers) {
                map[answers[k]] = k;
                answerStrings.push(answers[k]);
            }
        }
        var buttons = jQuery('<form class="askConfirmAnswers"></form>');
        buttons.html(jQuery.map(answerStrings, function(v) {
            //add by zhangxinxu http://www.zhangxinxu.com 给确认对话框的确认取消按钮添加不同的class
            var btn_index;
            if(v === answers[0]){
                btn_index = 1;
                return "<input class='queren' type='button' value='" + v + "' /><span></span>";
            }else if(v === answers[1]){
                btn_index = 2;
                return "<input class='quxiao' type='button' value='" + v + "' />";
            }else{
                btn_index = 3;
            }

        }).join(' '));
        jQuery('input[type=button]', buttons).click(function() {
            var clicked = this;
            Boxy.get(this).hide(function() {
                if (callback) callback(map[clicked.value]);
            });
        });
        p.append(buttons);
        body.append(p);
        new Boxy(body, options);
    },
    //验证码
    code: function(answers,after1,options) { //[msg,['button','url'],['button2','url']]自定义
        return Boxy.codeAsk(answers, function(response) {
            if (response == answers[0]) after1();
        }, options);
    },
    codeAsk: function(answers, callback, options){
        options = jQuery.extend({modal: true, closeable: false},
            options || {},
            {show: true, unloadOnHide: true});
        var img_click="'";
        var body = jQuery('<div style="background: #fff;"></div>');
        var  string='<div class="security_box" style="padding:20px;display:block;margin-top:20px;position: relative" id="reg_yzm_code"><div style="position: absolute;right:2px;top:2px; width:20px;height:20px;" onclick="Boxy.close();"><img src="http://img.komovie.cn/sub/gift_packs/1/ico_close.png" width="100%" /></div>';
               string+='<div class="security_row">';
                  string+='<div class="se_info"><input class="se_input" value="" id="code_value_yzm" maxlength="4" style="text-align: center;"/></div>';
                  string+='<div class="se_prefix" style="text-align:right;">提示码&nbsp;</div>';
                  string+='<div class="clear"></div>';
               string+='</div>';
               string+='<div class="security_row clearfix">';
                   string+='<div class="safe_item"><img class="yzm_img" id="yzm_images" src="/common/code?rand="'+Math.random()*100+'/></div>';
                   string+='<div class="se_prefix" style="text-align:right;"><a href="javascript:void(0)" class="safe_item_refresh"  style="text-align:right;" onclick="Boxy.codeOnclick();">看不清？</a></div>';
                string+='</div>';
                string+='<div class="security_row"><p style=" text-align: center; color: #666;">请输入上方的图形提示码</p></div>';
                string+='<div class="security_row"><p style=" text-align: center;" onclick="sendMsg();"><a class="submit">确认</a></p></div>';
             string+='</div>';

        body.append(string);
        new Boxy(body, options);
        document.getElementsByClassName('boxy-modal-blackout')[0].style.background="#000";
        document.getElementById('yzm_images').src='/common/code?rand='+Math.random()*100;
       // document.getElementById('boxy-modal-blackout').src='/common/code?rand='+Math.random()*100;
    },
    codeOnclick:function(){
        document.getElementById('yzm_images').src='/common/code?rand='+Math.random()*100;
    },

    //关闭对话框
    close:function(){
        $(".boxy-wrapper,.boxy-modal-blackout").remove();
    },

    ask: function(question, answers, callback, options) {
        
        options = jQuery.extend({modal: true, closeable: false},
                                options || {},
                                {show: true, unloadOnHide: true});
        
        var body = jQuery('<div></div>').append(jQuery('<div class="question"></div>').html(question));
        
        // ick
        var map = {}, answerStrings = [];
        if (answers instanceof Array) {
            for (var i = 0; i < answers.length; i++) {
                map[answers[i]] = answers[i];
                answerStrings.push(answers[i]);
            }
        } else {
            for (var k in answers) {
                map[answers[k]] = k;
                answerStrings.push(answers[k]);
            }
        }
        
        var buttons = jQuery('<form class="answers"></form>');
        buttons.html(jQuery.map(answerStrings, function(v) {
			//add by zhangxinxu http://www.zhangxinxu.com 给确认对话框的确认取消按钮添加不同的class
			var btn_index; 	
			if(v === "确认"){
				btn_index = 1;
			}else if(v === "取消"){
				btn_index = 2;
			}else{
				btn_index = 3;	
			}
			//add end.  include the 'btn_index' below 
            return "<input class='boxy-btn"+btn_index+"' type='button' value='" + v + "' />";
        }).join(' '));
        
        jQuery('input[type=button]', buttons).click(function() {
            var clicked = this;
            Boxy.get(this).hide(function() {
                if (callback) callback(map[clicked.value]);
            });
        });
        
        body.append(buttons);
        
        new Boxy(body, options);
        
    },
    
    // returns true if a modal boxy is visible, false otherwise
    isModalVisible: function() {
        return jQuery('.boxy-modal-blackout').length > 0;
    },
    
    _u: function() {
        for (var i = 0; i < arguments.length; i++)
            if (typeof arguments[i] != 'undefined') return false;
        return true;
    },
    
    _handleResize: function(evt) {
        var d = jQuery(document);
        jQuery('.boxy-modal-blackout').css('display', 'none').css({
            width: d.width(), height: d.height()
        }).css('display', 'block');
    },
    
    _handleDrag: function(evt) {
        var d;
        if (d = Boxy.dragging) {
            d[0].boxy.css({left: evt.pageX - d[1], top: evt.pageY - d[2]});
        }
    },
    
    _nextZ: function() {
        return Boxy.zIndex++;
    },
    
    _viewport: function() {
        var d = document.documentElement, b = document.body, w = window;
        return jQuery.extend(
            jQuery.browser.msie ?
                { left: b.scrollLeft || d.scrollLeft, top: b.scrollTop || d.scrollTop } :
                { left: w.pageXOffset, top: w.pageYOffset },
            !Boxy._u(w.innerWidth) ?
                { width: w.innerWidth, height: w.innerHeight } :
                (!Boxy._u(d) && !Boxy._u(d.clientWidth) && d.clientWidth != 0 ?
                    { width: d.clientWidth, height: d.clientHeight } :
                    { width: b.clientWidth, height: b.clientHeight }) );
    }

});

Boxy.prototype = {
    
    // Returns the size of this boxy instance without displaying it.
    // Do not use this method if boxy is already visible, use getSize() instead.
    estimateSize: function() {
        this.boxy.css({visibility: 'hidden', display: 'block'});
        var dims = this.getSize();
        this.boxy.css('display', 'none').css('visibility', 'visible');
        return dims;
    },
                
    // Returns the dimensions of the entire boxy dialog as [width,height]
    getSize: function() {
        return [this.boxy.width(), this.boxy.height()];
    },
    
    // Returns the dimensions of the content region as [width,height]
    getContentSize: function() {
        var c = this.getContent();
        return [c.width(), c.height()];
    },
    
    // Returns the position of this dialog as [x,y]
    getPosition: function() {
        var b = this.boxy[0];
        return [b.offsetLeft, b.offsetTop];
    },
    
    // Returns the center point of this dialog as [x,y]
    getCenter: function() {
        var p = this.getPosition();
        var s = this.getSize();
        return [Math.floor(p[0] + s[0] / 2), Math.floor(p[1] + s[1] / 2)];
    },
                
    // Returns a jQuery object wrapping the inner boxy region.
    // Not much reason to use this, you're probably more interested in getContent()
    getInner: function() {
        return jQuery('.boxy-inner', this.boxy);
    },
    
    // Returns a jQuery object wrapping the boxy content region.
    // This is the user-editable content area (i.e. excludes titlebar)
    getContent: function() {
        return jQuery('.boxy-content', this.boxy);
    },
    
    // Replace dialog content
    setContent: function(newContent) {

        if(this.options.visibility){
            newContent = jQuery(newContent).css({display: 'block',background:'none'}).addClass('boxy-content');
        }else{
            newContent = jQuery(newContent).css({display: 'block'}).addClass('boxy-content');
        }
        if (this.options.clone) newContent = newContent.clone(true);
        this.getContent().remove();
        this.getInner().append(newContent);
        this._setupDefaultBehaviours(newContent);
        this.options.behaviours.call(this, newContent);
        return this;
    },
    
    // Move this dialog to some position, funnily enough
    moveTo: function(x, y) {
        this.moveToX(x).moveToY(y);
        return this;
    },
    
    // Move this dialog (x-coord only)
    moveToX: function(x) {
        if (typeof x == 'number') this.boxy.css({left: x});
        else this.centerX();
        return this;
    },
    
    // Move this dialog (y-coord only)
    moveToY: function(y) {
        if (typeof y == 'number') this.boxy.css({top: y});
        else this.centerY();
        return this;
    },
    
    // Move this dialog so that it is centered at (x,y)
    centerAt: function(x, y) {
        var s = this[this.visible ? 'getSize' : 'estimateSize']();
        if (typeof x == 'number') this.moveToX(x - s[0] / 2);
        if (typeof y == 'number') this.moveToY(y - s[1] / 2);
        return this;
    },
    
    centerAtX: function(x) {
        return this.centerAt(x, null);
    },
    
    centerAtY: function(y) {
        return this.centerAt(null, y);
    },
    
    // Center this dialog in the viewport
    // axis is optional, can be 'x', 'y'.
    center: function(axis) {
        var v = Boxy._viewport();
        var o = this.options.fixed ? [0, 0] : [v.left, v.top];
        if (!axis || axis == 'x') this.centerAt(o[0] + v.width / 2, null);
        if (!axis || axis == 'y') this.centerAt(null, o[1] + v.height / 2);
        return this;
    },
    
    // Center this dialog in the viewport (x-coord only)
    centerX: function() {
        return this.center('x');
    },
    
    // Center this dialog in the viewport (y-coord only)
    centerY: function() {
        return this.center('y');
    },
    
    // Resize the content region to a specific size
    resize: function(width, height, after) {
        if (!this.visible) return;
        var bounds = this._getBoundsForResize(width, height);
        this.boxy.css({left: bounds[0], top: bounds[1]});
        this.getContent().css({width: bounds[2], height: bounds[3]});
        if (after) after(this);
        return this;
    },
    
    // Tween the content region to a specific size
    tween: function(width, height, after) {
        if (!this.visible) return;
        var bounds = this._getBoundsForResize(width, height);
        var self = this;
        this.boxy.stop().animate({left: bounds[0], top: bounds[1]});
        this.getContent().stop().animate({width: bounds[2], height: bounds[3]}, function() {
            if (after) after(self);
        });
        return this;
    },
    
    // Returns true if this dialog is visible, false otherwise
    isVisible: function() {
        return this.visible;    
    },
    
    // Make this boxy instance visible
    show: function() {
        if (this.visible) return;
        if (this.options.modal) {
            var self = this;
            if (!Boxy.resizeConfigured) {
                Boxy.resizeConfigured = true;
                jQuery(window).resize(function() { Boxy._handleResize(); });
            }
            this.modalBlackout = jQuery('<div class="boxy-modal-blackout"></div>')
                .css({zIndex: Boxy._nextZ(),
                      opacity: 0.3,
                      width: jQuery(document).width(),
                      height: jQuery(document).height()})
                .appendTo(document.body);
            this.toTop();
            if (this.options.closeable) {
                jQuery(document.body).bind('keypress.boxy', function(evt) {
                    var key = evt.which || evt.keyCode;
                    if (key == 27) {
                        self.hide();
                        jQuery(document.body).unbind('keypress.boxy');
                    }
                });
            }
        }
        this.boxy.stop().css({opacity: 1}).show();
        this.visible = true;
        this._fire('afterShow');
        return this;
    },
    
    // Hide this boxy instance
    hide: function(after) {
        if (!this.visible) return;
        var self = this;
        if (this.options.modal) {
            jQuery(document.body).unbind('keypress.boxy');
            this.modalBlackout.animate({opacity: 0}, function() {
                jQuery(this).remove();
            });
        }
        this.boxy.stop().animate({opacity: 0}, 300, function() {
            self.boxy.css({display: 'none'});
            self.visible = false;
            self._fire('afterHide');
            if (after) after(self);
            if (self.options.unloadOnHide) self.unload();
        });
        return this;
    },
    
    toggle: function() {
        this[this.visible ? 'hide' : 'show']();
        return this;
    },
    
    hideAndUnload: function(after) {
        this.options.unloadOnHide = true;
        this.hide(after);
        return this;
    },
    
    unload: function() {
        this._fire('beforeUnload');
        this.boxy.remove();
        if (this.options.actuator) {
            jQuery.data(this.options.actuator, 'active.boxy', false);
        }
    },
    
    // Move this dialog box above all other boxy instances
    toTop: function() {
        this.boxy.css({zIndex: Boxy._nextZ()});
        return this;
    },
    
    // Returns the title of this dialog
    getTitle: function() {
        return jQuery('> .title-bar h2', this.getInner()).html();
    },
    
    // Sets the title of this dialog
    setTitle: function(t) {
        jQuery('> .title-bar h2', this.getInner()).html(t);
        return this;
    },
    
    //
    // Don't touch these privates
    
    _getBoundsForResize: function(width, height) {
        var csize = this.getContentSize();
        var delta = [width - csize[0], height - csize[1]];
        var p = this.getPosition();
        return [Math.max(p[0] - delta[0] / 2, 0),
                Math.max(p[1] - delta[1] / 2, 0), width, height];
    },
    
    _setupTitleBar: function() {
        if (this.options.title) {
            var self = this;
            var tb = jQuery("<div class='title-bar'></div>").html("<h2>" + this.options.title + "</h2>");
            if (this.options.closeable) {
                tb.append(jQuery("<a href='#' class='closeText'></a>").html(this.options.closeText));
            }
            if (this.options.draggable) {
                tb[0].onselectstart = function() { return false; }
                tb[0].unselectable = 'on';
                tb[0].style.MozUserSelect = 'none';
                if (!Boxy.dragConfigured) {
                    jQuery(document).mousemove(Boxy._handleDrag);
                    Boxy.dragConfigured = true;
                }
                tb.mousedown(function(evt) {
                    self.toTop();
                    Boxy.dragging = [self, evt.pageX - self.boxy[0].offsetLeft, evt.pageY - self.boxy[0].offsetTop];
                    jQuery(this).addClass('dragging');
                }).mouseup(function() {
                    jQuery(this).removeClass('dragging');
                    Boxy.dragging = null;
                    self._fire('afterDrop');
                });
            }
            this.getInner().prepend(tb);
            this._setupDefaultBehaviours(tb);
        }
    },
    
    _setupDefaultBehaviours: function(root) {
        var self = this;
        if (this.options.clickToFront) {
            root.click(function() { self.toTop(); });
        }
        jQuery('.close', root).click(function() {
            self.hide();
            return false;
        }).mousedown(function(evt) { evt.stopPropagation(); });
    },
    
    _fire: function(event) {
        this.options[event].call(this);
    }
    
};
