# babel-plugin-nornj-loader
make [nornj-loader](https://github.com/joe-sky/nornj-loader) enabled in babel to support SSR.

Install
-----

```javascript

npm install --save-dev babel-plugin-nornj-loader

```


Usage
-----

in <span style="background-color: #f1f1f1;padding:0 5px;">.babelrc</span> file:

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


