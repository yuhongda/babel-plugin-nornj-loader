const nj = require('nornj').default,
    includeParser = require('nornj/tools/includeParser'),
    njUtils = require('nornj/tools/utils'),
    loaderUtils = require('loader-utils');

function buildTmplFns(fns, tmplKey) {
    let ret = '{\n';
    ret += '  _njTmplKey: ' + tmplKey + ',\n';

    nj.each(fns, (v, k, i, l) => {
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
    this.cacheable && this.cacheable();

    //Create delimiter rule of templates
    const { delimiters } = options;
    let tmplRule = nj.tmplRule;
    if (delimiters != null) {
        if (delimiters.toLowerCase() === 'react') {
            tmplRule = nj.createTmplRule({
            start: '{',
            end: '}',
            comment: ''
            });
        } else {
            tmplRule = nj.createTmplRule(delimiters);
        }
    }

    //Default conversion to compiled template functions
    let compiled = true;

    //Set configs for extension tags and filters
    if (options.extensionConfig) {
        let extensionConfig = {};
        nj.each(options.extensionConfig, (v, k) => {
            extensionConfig[k] = {
            options: v
            };
        });

        nj.registerExtension(extensionConfig);
    }
    if (options.filterConfig) {
        let filterConfig = {};
        nj.each(options.filterConfig, (v, k) => {
            filterConfig[k] = {
            options: v
            };
        });

        nj.registerFilter(filterConfig);
    }

    //Parse the "include" and "template" block
    let tmpls = includeParser(source, filepath, tmplRule, true),
        tmplNames = Object.keys(tmpls),
        output = '';

    //Precompiling template
    if (tmplNames.length == 1 && tmplNames[0] === 'main') {
        if (tmpls.main.trim().length > 0) {
            const tmplKey = njUtils.uniqueKey(tmpls.main);

            if (compiled) {
                output = 'nj.' + getCompileFnName(options.outputH) + '(' + buildTmplFns(nj.precompile(tmpls.main, options.outputH, tmplRule), tmplKey) + ');';
            } else {
                output = buildTmplFns(nj.precompile(tmpls.main, options.outputH, tmplRule), tmplKey) + ';';
            }
        }
    } else { //Output multiple templates
        var tmplsStr = {};
        nj.each(tmpls, (tmpl, name, i, l) => {
            if (tmpl.trim().length > 0) {
                const tmplKey = njUtils.uniqueKey(tmpl);
                
                if (compiled) {
                    tmplsStr[name] = 'nj.' + getCompileFnName(options.outputH) + '(' + buildTmplFns(nj.precompile(tmpl, options.outputH, tmplRule), tmplKey) + ')';
                } else {
                    tmplsStr[name] = buildTmplFns(nj.precompile(tmpl, options.outputH, tmplRule), tmplKey);
                }

            }
        });
        output = tmplsStr;
    }

    return output;
};

module.exports = {
    loadTemplate
}



