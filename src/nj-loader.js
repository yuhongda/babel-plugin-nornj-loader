const nj = require('nornj').default,
    includeParser = require('nornj/tools/includeParser'),
    njUtils = require('nornj/tools/utils');

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
    //Create delimiter rule of templates
    const { delimiters } = options;
    let tmplRule = nj.tmplRule;
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
      let extensionConfig = {},
          extensionConfigs = options.extensionConfig;
      if (!Array.isArray(extensionConfigs)) {
          extensionConfigs = [extensionConfigs];
      }
  
      nj.each(extensionConfigs, exConfig => {
          nj.each(exConfig, (v, k) => {
              extensionConfig[k] = {
                  options: v
              };
          });
      });
      nj.registerExtension(extensionConfig);
    }
    if (options.filterConfig) {
      let filterConfig = {},
          filterConfigs = options.filterConfig;
      if (!Array.isArray(filterConfigs)) {
          filterConfigs = [filterConfigs];
      }
  
      nj.each(filterConfigs, fConfig => {
          nj.each(fConfig, (v, k) => {
              filterConfig[k] = {
                  options: v
              };
          });
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
            output = buildTmplFns(nj.precompile(tmpls.main, options.outputH, tmplRule), tmplKey);
        }
    } else { //Output multiple templates
        var tmplsStr = {};
        nj.each(tmpls, (tmpl, name, i, l) => {
            if (tmpl.trim().length > 0) {
                const tmplKey = njUtils.uniqueKey(tmpl);
                tmplsStr[name] = buildTmplFns(nj.precompile(tmpl, options.outputH, tmplRule), tmplKey);
            }
        });
        output = tmplsStr;
    }

    return output;
};

module.exports = {
    loadTemplate,
    getCompileFnName
}



