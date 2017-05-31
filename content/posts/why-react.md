---
layout: post
title: "Why Use React?"
category: computers
tags: [react, javascript, programming]
date: 2017/4/17
---

Introductions are hard, so I'm just gonna jump right into this.

---

Here's an example from the Vue.js getting started [guide](http://vuejs.org/v2/guide/):

``` javascript
var app4 = new Vue({
  el: '#app-4',
  data: {
    todos: [
      { text: 'Learn JavaScript' },
      { text: 'Learn Vue' },
      { text: 'Build something awesome' }
    ]
  }
})
```

``` html
<div id="app-4">
  <ol>
    <li v-for="todo in todos">
      {{ todo.text }}
    </li>
  </ol>
</div>
```

If you're familiar with JavaScript, the first chunk shouldn't be too hard to grok. The second part is HTML, except Vue has introduced the attribute `v-for` into the mix, which lets you perform a loop with some crazy Vue magic.

This is how I would do the same thing done in React:

``` javascript
var data = [
  { text: 'Learn JavaScript' },
  { text: 'Learn React' },
  { text: 'Build something awesome' }
]

var TodoList = props =>
  <ol>
    {props.todos.map((todo, index) =>
      <li key={index}>{todo.text}</li>)}
  </ol>

ReactDOM.render(<TodoList todos={data} />, document.querySelector('#app'))
```

It introduces markup directly into the JavaScript file, but uses JavaScript's existing logic, in this case it uses `map` to iterate and transform the array.

---

I think this shows the two fundamental differences between the two approaches:

* Vue and Angular try to shim logic into markup.
* React tries to shim markup into logic.

Both of these approaches create a [DSL](https://en.wikipedia.org/wiki/Domain-specific_language).

When you're working with Vue or Angular you're using their flavor of logic mixed into your HTML.

When you're working with React, you use JavaScript's native logic mixed with it's flavor of markup (JSX).

JSX is the biggest deviation from regular JavaScript that React introduces, it's similar to XML/HTML, but not quite same. The difference between JSX and the normal HTML you'd write can be summed up pretty quickly:

  * attributes that are hyphenated must be converted to camelCase (ie `tab-index` becomes `tabIndex`)
  * JavaScript keywords must be re-named (ie `class="foo bar"` becomes `className="foo bar"`)
  * all tags must have a closing tag or be self closing (ie `<div></div>` or `<div />`)

Besides the ability to embed arbitrary JavaScript expressions by wrapping them in curly braces, that's all you need to know about JSX.

React has a pretty minimal API. A component can have props, state, and some life cycle hooks. That's really all there is to it.

This is why I use and recommend React.

Conversely, Angular and Vue introduce a huge amount of DSL logic, and Angular in particular has one of the largest APIs I've ever seen in a library. The more time spent learning a library, the less time spent writing application code.

I won't pretend it's all sunshine and rainbows though. Angular and Vue have the benefit of being able drop in a `<script>` tag and go to town. With React there's some pretty complex tooling involved if you want to use JSX, at minimum you need a transpiler like Babel (which thankfully can be learned in ~5 minutes), and to properly organize your code into separate files you'll want a bundler like Webpack (which can take you hours to get working how you'd like).

---

"But why do I want to go through all that when what I'm doing works perfectly well right now?" You may ask. And I don't have a good answer for you, but I would like to offer you a small example of what it's like using React to query a JSON API and print the results.

<a class="jsbin-embed" href="http://jsbin.com/cipamoj/embed?js,output">JS Bin on jsbin.com</a>
<script src="http://static.jsbin.com/js/embed.min.js?3.41.10"></script>
