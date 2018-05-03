'use strict';

var nj = require('nornj').default,
    includeParser = require('nornj/tools/includeParser'),
    njUtils = require('nornj/tools/utils');

function buildTmplFns(fns, tmplKey) {
    var ret = '{\n';
    ret += '  _njTmplKey: ' + tmplKey + ',\n';

    nj.each(fns, function (v, k, i, l) {
        if (k.indexOf('_') != 0) {
            ret += '  ' + k + ': ' + v.toString() + (i < l - 1 ? ',' : '') + '\n';
        }
    });

    return ret + '}';
}

function getCompileFnName(outputH) {
    return outputH ? 'compileH' : 'compile';
}

function loadTemplate(source, filepath, options) {
    //Create delimiter rule of templates
    var delimiters = options.delimiters;

    var tmplRule = nj.tmplRule;
    if (delimiters != null) {
        if (nj.isString(delimiters) && delimiters.toLowerCase() === 'react') {
            tmplRule = nj.createTmplRule({
                start: '{',
                end: '}',
                comment: ''
            });
        } else {
            tmplRule = nj.createTmplRule(delimiters);
        }
    }

    //Set configs for extension tags and filters
    if (options.extensionConfig) {
        var extensionConfig = {},
            extensionConfigs = options.extensionConfig;
        if (!Array.isArray(extensionConfigs)) {
            extensionConfigs = [extensionConfigs];
        }

        nj.each(extensionConfigs, function (exConfig) {
            nj.each(exConfig, function (v, k) {
                extensionConfig[k] = {
                    options: v
                };
            });
        });
        nj.registerExtension(extensionConfig);
    }
    if (options.filterConfig) {
        var filterConfig = {},
            filterConfigs = options.filterConfig;
        if (!Array.isArray(filterConfigs)) {
            filterConfigs = [filterConfigs];
        }

        nj.each(filterConfigs, function (fConfig) {
            nj.each(fConfig, function (v, k) {
                filterConfig[k] = {
                    options: v
                };
            });
        });
        nj.registerFilter(filterConfig);
    }

    //Parse the "include" and "template" block
    var tmpls = includeParser(source, filepath, tmplRule, true),
        tmplNames = Object.keys(tmpls),
        output = '';

    //Precompiling template
    if (tmplNames.length == 1 && tmplNames[0] === 'main') {
        if (tmpls.main.trim().length > 0) {
            var tmplKey = njUtils.uniqueKey(tmpls.main);
            output = buildTmplFns(nj.precompile(tmpls.main, options.outputH, tmplRule), tmplKey);
        }
    } else {
        //Output multiple templates
        var tmplsStr = {};
        nj.each(tmpls, function (tmpl, name, i, l) {
            if (tmpl.trim().length > 0) {
                var _tmplKey = njUtils.uniqueKey(tmpl);
                tmplsStr[name] = buildTmplFns(nj.precompile(tmpl, options.outputH, tmplRule), _tmplKey);
            }
        });
        output = tmplsStr;
    }

    return output;
};

module.exports = {
    loadTemplate: loadTemplate,
    getCompileFnName: getCompileFnName
};