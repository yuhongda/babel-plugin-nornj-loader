'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _requireResolve = require('require-resolve');

var _requireResolve2 = _interopRequireDefault(_requireResolve);

var _nornj = require('nornj');

var _nornj2 = _interopRequireDefault(_nornj);

var _njLoader = require('./nj-loader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (babel) {
    var t = babel.types;

    var defaultExtensions = ['.t.html', '.t.htm', '.nj.html', '.nj.htm', '.nornj', '.nj'];

    return {
        visitor: {
            ImportDeclaration: function ImportDeclaration(path, state) {
                var node = path.node,
                    dec = void 0;
                var src = path.node.source.value;
                var reference = state && state.file && state.file.opts.filename;
                var extensions = state && state.opts && state.opts.extensions || defaultExtensions;
                var outputH = state && state.opts && state.opts.outputH || true;
                var delimiters = state && state.opts && state.opts.delimiters || 'react';
                var shouldUseNjLoader = false;
                var templates = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = extensions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var ext = _step.value;

                        if (src.endsWith(ext)) {
                            shouldUseNjLoader = true;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                if (!shouldUseNjLoader) {
                    return;
                }
                var id = path.node.specifiers[0].local.name;
                var mod = (0, _requireResolve2.default)(src, _path2.default.resolve(reference));
                var content = _fs2.default.readFileSync(mod.src).toString();

                templates = (0, _njLoader.loadTemplate)(content, mod.src, { outputH: outputH, delimiters: delimiters });

                var variable = void 0;
                if (_nornj2.default.isObject(templates)) {
                    variable = t.variableDeclarator(t.identifier(id), t.objectExpression(Object.keys(templates).map(function (key) {
                        return t.objectProperty(t.identifier(key), t.CallExpression(t.memberExpression(t.identifier('nj'), t.identifier((0, _njLoader.getCompileFnName)(outputH))), [t.identifier(templates[key])]));
                    })));
                } else {
                    variable = t.variableDeclarator(t.identifier(id), t.CallExpression(t.memberExpression(t.identifier('nj'), t.identifier((0, _njLoader.getCompileFnName)(outputH))), [t.identifier(templates)]));
                }

                path.replaceWith({
                    type: 'VariableDeclaration',
                    kind: 'const',
                    declarations: [variable],
                    leadingComments: [{
                        type: 'CommentBlock',
                        value: ' babel-plugin-nornj-loader \'' + src + '\' '
                    }]
                });
            }
        }
    };
};