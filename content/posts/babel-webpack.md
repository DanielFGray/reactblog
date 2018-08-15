---
layout: post
title: "Getting started with Babel and Webpack"
category: computers
tags: [javascript,nodejs,babel,webpack]
date: 2018-06-06
---

You've heard about them, maybe you don't know why you'd use them, maybe you just want to know how to get started with them. Read on!

# Why?

Imagine you have written some JavaScript code, and you want to depend on some external library, like jQuery or React. You can use separate `<script>` tags in your HTML page but this results in two separate requests, which is slower than one, and becomes unwieldy if/when you need more dependencies.

*Enter Webpack, stage left*

Webpack bundles your dependencies into a single file (it also has options for splitting them into separate "chunks"). It takes a file (it calls it an entry point), looks for your dependencies that use calls to `require`, and recursively scans those files for more dependencies, and gives you a bundle.

Imagine you also want to write your JavaScript using ES2015 (aka ES6) or newer syntax, but want to support older browsers that may not have it.

*Enter Babel, stage right*

Together these tools can help simplify your workflow while giving you a lot of power over how to manage your code.

# How?

Let's create a project, and install Webpack and for the sake of example use jquery as a dependency.

``` bash
mkdir first-bundle
cd first-bundle
npm init -y
npm i -D webpack{,-cli}
npm i -S jquery
```

Create a simple file at `src/index.js`

``` javascript
// src/index.js
const $ = require('jquery')

$('body').prepend('<h1>hello world</h1>')
```

Now use Webpack to compile it, and check the output

``` bash
npx webpack --mode development
less dist/main.js
```

> if `npx webpack` is not available, use `./node_modules/.bin/webpack`

Note the difference when using production mode

``` bash
npx webpack --mode production
less dist/main.js
```

Now let's add babel into this mix

``` bash
npm i -D babel-{core,loader,preset-env}
```

A small config for babel

``` json
// .babelrc
{
  "plugins": [
    ["env", { "modules": false }]
  ]
}
```

And now we need to make a small webpack config and tell it to use babel 

``` javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
}
```

Now let's make a new smaller test case just to test Babel

``` javascript
// src/index.js
const test = () => console.log('hello world')
test()
```

And build it one more time and check the output

``` bash
npx webpack --mode production
less dist/main.js
```

Note that Webpack has a small overhead in the bundle size, just under 1KB.

# Level Up

Let's extract our rules into a separate variable

``` javascript
// webpack.config.js
const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: 'babel-loader',
  },
]

module.exports = {
  module: {
    rules,
  },
}
```

Webpack uses a default "entry point" of `src/index.js`, which we can override: 

``` javascript
// webpack.config.js
/* ... */
const entry = { main: 'src/app.js' }
module.exports = {
  entry,
  module: {
    rules,
  },
}
```

Changing the output path is slightly more complicated:

``` javascript
// webpack.config.js
const path = require('path')
/* ... */
const entry = { main: 'src/app.js' }
module.exports = {
  entry,
  output: {
    filename: '[name].bundle.js', // file will now be called main.bundle.js
    path: path.resolve(__dirname, 'public'), // changes the output directory to public
  },
  module: {
    rules,
  },
}
```

## React

Install React and a few Babel presets

``` bash
npm i -D babel-preset-{react,stage-1}
npm i -S react{,-dom}
```

Add the presets to `.babelrc`

``` json
// .babelrc
{
  "plugins": [
    ["env", { "modules": false }],
    "react",
    "stage-1"
  ]
}
```

A small change to the Webpack config:

``` javascript
// webpack.config.js
const rules = [
  {
    test: /\.jsx?$/, // enables babel to work on .jsx extensions
    exclude: /node_modules/,
    use: 'babel-loader',
  },
]
const entry = { main: 'src/app' }
module.exports = {
  entry,
  resolve: { extensions: ['.js', '.jsx'] }, // automagically resolves file extensions
  module: {
    rules,
  },
}
```

A small React example:

``` javascript
// src/app.jsx
import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
  state = { input: 'Hello world!' }

  inputChange = e => this.setState({ input: e.target.value })

  render() {
    return (
      <div>
        <h1>{this.state.input}</h1>
        <input value={this.state.input} onChange={this.inputChange} />
      </div>
    )
  }
}

const render = () => ReactDOM.render(<App />, document.querySelector('body'))

document.addEventListener('DOMContentLoaded', render)
```

Bundle it all up

``` bash
npx webpack --mode production
less public/main.bundle.js
```

---

### TODO
* more recipes?
* webpack-dev-server/middleware
* html-webpack-plugin
* babel-node and compiling for node 
* vendor bundle splitting
* css modules
* postcss
* babel-plugin-lodash
* flow
* typescript
