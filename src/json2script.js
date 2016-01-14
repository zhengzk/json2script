/**
 * Created by zhengzk on 2015/11/18.
 */
'use strict';
var Block = require('./block'),
    utils = require('./utils');

var tags = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

/**
 * parse Json to Script
 * @param data
 * @param options
 * @constructor
 */
var  JSON2Script = function(data,options){
    this.options = options || {};
    this.block = new Block();
    return this.processData(data);
};

JSON2Script.prototype = {
    processData:function(data){

        this.block.writeLine("function(options){",1);
        if(data.length > 0 ) {
            this.block.writeLine("var frag = document.createDocumentFragment();");
            this.processNodes(data,"frag");
            this.block.writeLine("this.fragment = frag;");
            this.block.writeLine("return frag;");
        }
        this.block.indent(-1);
        this.block.writeLine("}");
        var ret = this.block.build();
        var _name = this.options.name;
        var _translate = this.options.translate;
        if(utils.isFunction(_translate)){
            return
        }
        return base + '.routes("' + _name + '",true);\n'
             + "var " + utils.parseName(_name) + " = " + utils.isFunction(_translate) ? _translate(ret,_name) : ret + ";\n";
    },
    processNodes:function(nodes,parent){
        for (var i = 0, len = nodes.length; i < len; i++) {
            this.processNode(nodes[i],parent + "_" + i,parent);
        }
        return str;
    },
    processNode:function(node,varName,parent){
        //var _append_flag = true;
        switch (d.type) {
            case 'directive':
                break;
            case 'tag':
                this["render" + utils.upperCase(node.type)](node,varName,parent);
                break;
        }
        //if(_append_flag){
        //    this.block.writeLine( parent !== "frag" ? (parent + ".append("+ varName +");"):"frag.appendChild("+ varName +");");
        //}
    },
    renderAppend:function(parent,varName){
        this.block.writeLine( parent !== "frag" ? (parent + ".append("+ varName +");"):"frag.appendChild("+ varName +");");
    },
    renderDirective:function(){
        //{"name": "!doctype", "data": "!DOCTYPE html", "type": "directive"}
    },
    renderTag:function(node,varName,parent){
        var isDOM = tags.indexOf(node.name)>=0;
        if(isDOM){
            this.renderElement(node,varName,parent);
        }else{
            this.renderComponent(node,varName,parent);
        }

    },
    renderElement:function(node,varName,parent){
        var base =  this.options.utils;
    },
    getTagStr:function(data,parent,varName){
    //{"type": "tag", "name": "body", "attribs": {},"children": []}
        var base =  this.options.utils;
        var str = '';
        var attribs = data.attribs;
        var attrs = {};
        var events = {};
        var endStr = "";
        for(var key in attribs){
            if(key == 'id'){
                endStr += 'this["'+attribs[key]+'"] = ' + varName + ';\n';
                continue;
            }
            if(key.indexOf('on') == 0 ){
                events[key] = attribs[key];
            }else{
                attrs[key] = attribs[key];
            }
        }
        var isDOM = tags.indexOf(data.name)>=0;
        if(isDOM){
            str += 'var ' + varName + ' = ' + base + '.create("' + data.name + '",'+ JSON.stringify(attrs) +');';
            str += this.getTagEventsStr(varName,events);
            if(data.children){
                str += this.getDataStr(data.children,varName);
            }
        }else{//组件
            var options = {
                attrs:attrs,
                events:events
            };
            str += 'var ' + varName + ' = new ' + this.parseObjectName(data.name) + "(" + JSON.stringify(options) + ");";
            var translate = this.options.translate;
            if(translate) {
                if(parent != 'frag') {
                    str += parent + '.append(' + varName + '.fragment);';
                }else{
                    str += parent + '.appendChild(' + varName + '.fragment);';
                }
                return str + endStr;
            }
        }

        if(parent != 'frag') {
            str += parent + '.append(' + varName + ');';
        }else{
            str += parent + '.appendChild(' + varName + '[0]);';
        }
        return str + endStr;
    },
    getTagEventsStr:function(varName,events){
        var str = '';
        //fn.call(this[i], i, this[i]);
        for(var key in events){
            var _event = key.replace('on','');
            var _fun = events[key];
            if(_fun.indexOf('function') < 0){
                _fun = 'function(e){'+_fun+'}';
            }
            str += varName + '.bind("' + _event + '",' + _fun + ');';
        }
        return str;
    },
    /**
     * processOptions
     * @param options
     */
    processOptions:function (options) {
        if (typeof options !== 'object') {
            options = {};
        }

        if (typeof options.base === 'undefined') {
            options.base = 'base';
        }

        //if (typeof options.path === 'undefined') {
        //    options.path = process.cwd();
        //}

        if (typeof options.cb_error !== 'function') {
            options.cb_error = function(){

            }
        }
        // parses the file as an ES6 module, except disabled implicit strict-mode
        //if (typeof options.sourceType === 'undefined') {
        //    options.sourceType = 'nonStrictModule';
        //}
        return options;
        var ret = utils.merge({},options);
        if(options.translate){
            ret.translate = utils.merge({
                "factory":"vvp.CoreObject.extend",
                "utils":"base",
                "base":"base.view"
            },options.translate);
        }
        return ret;
    }
};
