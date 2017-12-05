'use strict';
import fs from 'fs';
import nodePath from 'path';
import requireResolve from 'require-resolve';
import nj from 'nornj';
import { loadTemplate } from './nj-loader';

module.exports = function(babel) {
    var t = babel.types;

    const defaultExtensions = [
        '.t.html'
    ];

    return {
        visitor: {
            ImportDeclaration(path, state){
                let node = path.node, dec;
                const src = path.node.source.value;
                let reference = state && state.file && state.file.opts.filename;
                const extensions = (state && state.opts && state.opts.extensions) || defaultExtensions;
                const outputH = (state && state.opts && state.opts.outputH) || true;
                const delimiters = (state && state.opts && state.opts.delimiters) || 'react';
                let shouldUseNjLoader = false;
                let templates = [];

                for (const ext of extensions) {
                    if (src.endsWith(ext)) {
                        shouldUseNjLoader = true;
                    }
                }

                if(!shouldUseNjLoader){
                    return;
                }
                const id = path.node.specifiers[0].local.name;
                const mod = requireResolve(src, nodePath.resolve(reference));
                const content = fs.readFileSync(mod.src).toString();

                templates = loadTemplate(content, mod.src, {outputH, delimiters});

                const variable = t.variableDeclarator(t.identifier(id), t.objectExpression(Object.keys(templates).map(key => {
                    return t.objectProperty(t.identifier(key), t.identifier(templates[key]))
                })));

                path.replaceWith({
                    type: 'VariableDeclaration',
                    kind: 'const',
                    declarations: [variable],
                    leadingComments: [
                        {
                            type: 'CommentBlock',
                            value: ` babel-plugin-nornj-loader '${src}' `
                        }
                    ]
                });
            }
        }
    };
};