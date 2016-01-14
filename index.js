/**
 * Created by zhengzk on 2015/11/18.
 */
'use strict';

var fs = require('fs'),
    utils = require('./src/utils'),
    json2script = require('./src/json2script');

var config = require('./config.json');

/**
 * compile
 * @param str
 * @param options
 * @returns {*}
 */
exports.compile = function(data, options) {
    options = utils.merge(config,options);
    if(!options.name){
        throw new Error("please set name");
    }
    return new json2script(data, options);
};


/**
 * compileFile
 * @param {String} path
 * @param {Object=} options
 * @returns {String}
 */
exports.compileFile = function(path, options) {
    return module.exports.compile(fs.readFileSync(path, 'utf8'),options);
};

