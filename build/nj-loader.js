var nj = require('nornj').default,
    includeParser = require('nornj/tools/includeParser'),
    njUtils = require('nornj/tools/utils'),
    loaderUtils = require('loader-utils');

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
    this.cacheable && this.cacheable();

    //Create delimiter rule of templates
    var delimiters = options.delimiters;

    var tmplRule = nj.tmplRule;
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
    var compiled = true;

    //Set configs for extension tags and filters
    if (options.extensionConfig) {
        var extensionConfig = {};
        nj.each(options.extensionConfig, function (v, k) {
            extensionConfig[k] = {
                options: v
            };
        });

        nj.registerExtension(extensionConfig);
    }
    if (options.filterConfig) {
        var filterConfig = {};
        nj.each(options.filterConfig, function (v, k) {
            filterConfig[k] = {
                options: v
            };
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

            if (compiled) {
                output = 'nj.' + getCompileFnName(options.outputH) + '(' + buildTmplFns(nj.precompile(tmpls.main, options.outputH, tmplRule), tmplKey) + ');';
            } else {
                output = buildTmplFns(nj.precompile(tmpls.main, options.outputH, tmplRule), tmplKey) + ';';
            }
        }
    } else {
        //Output multiple templates
        var tmplsStr = {};
        nj.each(tmpls, function (tmpl, name, i, l) {
            if (tmpl.trim().length > 0) {
                var _tmplKey = njUtils.uniqueKey(tmpl);

                if (compiled) {
                    tmplsStr[name] = 'nj.' + getCompileFnName(options.outputH) + '(' + buildTmplFns(nj.precompile(tmpl, options.outputH, tmplRule), _tmplKey) + ')';
                } else {
                    tmplsStr[name] = buildTmplFns(nj.precompile(tmpl, options.outputH, tmplRule), _tmplKey);
                }
            }
        });
        output = tmplsStr;
    }

    return output;

    // return {
    //     supplierList: nj.compile({
    //       _njTmplKey: -201639510,
    //       useString: true,
    //       main: function anonymous(p1,p2,p3,p4,p5) {

    //         var _type0 = 'div';
    //         var _params0 = ' class="' + '{styles.supplierList}' + '"';
    //         var _children0 = '';

    //         _children0 += '\n' + '  ' + p1.ls(p2) + '123';

    //         return '<' + _type0 + _params0 + '>' + _children0 + '\n' + p1.ls(p2) + '</' + _type0 + '>';
    //       }
    //     })
    // };
};

module.exports = {
    loadTemplate: loadTemplate
};