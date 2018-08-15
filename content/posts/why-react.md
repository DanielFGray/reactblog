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
const data = [
  { text: 'Learn JavaScript' },
  { text: 'Learn React' },
  { text: 'Build something awesome' }
]

const TodoList = props =>
  <ol>
    {props.todos.map(todo => (
      <li>
        {todo.text}
      </li>
    ))}
  </ol>

ReactDOM.render(<TodoList todos={data} />, document.querySelector('#app'))
```

It introduces markup directly into the JavaScript file, but uses JavaScript's existing logic; in this case tit uses `map` to iterate and transform the array.

---

I think this shows the two fundamental differences between the two approaches:

* Vue and Angular try to shim logic into markup.
* React tries to shim markup into logic.

Both of these approaches create a [DSL](https://en.wikipedia.org/wiki/Domain-specific_language).

When you're working with Vue or Angular you're using their flavor of logic mixed into your HTML.
t
When you're working with React, you use JavaScript's native logic mixed with its flavor of markup (JSX).

I think introducing logic into HTML is fixing the wrong part, I don't need magic in my HTML, I need a way to update the DOM from JavaScript.

JSX is the biggest deviation from regular JavaScript that React introduces, it's similar to XML/HTML, but not quite same. The difference between JSX and the normal HTML you'd write can be summed up pretty quickly:

  * attributes that are hyphenated must be converted to camelCase (ie `tab-index` becomes `tabIndex`)
  * JavaScript keywords must be re-named (ie `class="foo bar"` becomes `className="foo bar"`)
  * all tags must have a closing tag or be self closing (ie `<div></div>` or `<div />`)
  * you can embed arbitrary JavaScript expressions (to be distinguished from plain text) inside your markup by wrapping them in curly braces

And it's optional. JSX is just syntax sugar for a function that looks like:

``` javascript
React.createElement('div', { ...attributes }, [ ...children ])
```

Typical React components are just regular functions that return React elements. Arguments are called "props", and are read-only.
You can write classes which contain state and cause re-rendering, and there are some lifecycle hooks you can use in classes.

You make changes to state and React updates the DOM. That's really all there is to it.

This is why I use and recommend React.

Conversely, Angular and Vue introduce a huge amount of DSL logic, and Angular in particular has one of the largest APIs I've ever seen in a library. Vue also seems to get hairy when you want to do more complex things outside of the simple logic it tries to provide.

To be fair, with React there's some pretty complex tooling involved if you want to use JSX, at minimum you need a compiler like Babel, and a bundler like Webpack if you want to organize your code into multiple files and distribute it with React as well (See my post about them [here](./babel-webpack)).

If you've made it this far, you've learned pretty much everything about React except how to deal with state, so in parting I would like to offer a small example using React to query a JSON API and print the results.

<iframe src="https://codesandbox.io/embed/NkB6R6O2L?module=wRo98&autoresize=1&hidenavigation=1" style="width:100%; height:90vh; border:0; border-radius: 5px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
