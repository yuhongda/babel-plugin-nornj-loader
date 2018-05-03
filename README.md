# babel-plugin-nornj-loader

make [nornj-loader](https://github.com/joe-sky/nornj-loader) enabled to run in babel.

Install
-----

```javascript

npm install --save-dev babel-plugin-nornj-loader

```


Usage
-----

in `.babelrc` file:

```javascript

{
  "plugins": [
    ["babel-plugin-nornj-loader", {
      "extensions": [
        ".t.html"
      ]
    }]
  ]
}

```

How It Works

```js
import tmpls from './grid.t.html';
```

transform to:

```js
/* babel-plugin-nornj-loader './grid.t.html' */
var tmpls = {
  row: _nornj2.default.compileH({
    _njTmplKey: -1333168606,
    useString: false,
    fn1: function anonymous(p1,p2,p3,p4,p5) {
      return p2.d('children');
    },
    ...
  }),
  rowLeft: ...,
  rowRight: ...,
  col: ...,
  ...
};
```

## License

MIT