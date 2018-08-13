---
layout: post
title: 'Functional Programming: functional composition'
category: computers
tags: [programming, javascript, fp]
date: 2017/09/16
---

Creating functions like Lego blocks

---

# Arrow functions

This post makes use of a lot of [arrow functions][arrows] from the new ES2015 spec of JavaScript, which provides a shorter syntax for creating functions. So before we go any further, it's pretty important that you understand the following are all equivalent:

[arrows]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions

``` javascript
// function declaration
function add(a, b) {
  return a + b
}

// function expression
const add = function(a, b) {
  return a + b
}

// arrow function expression
const add = (a, b) => {
  return a + b
}

// arrow function with implicit return
const add = (a, b) => a + b
```

Arrow functions in JavaScript also provide [lexical `this`][lexical], but for the purposes of this article, just remember that the `=>` operator creates a function whose parameters are the thing to the left, and its body is the thing to the right.

[lexical]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#No_separate_this

# Functional composition

Imagine you have some series of computations to perform:

``` javascript
const yell = (str) => {
  const upper = str.toUpperCase()
  const exclaim = `${upper}!`
  return exclaim
}
// let's also imagine this is some non-trivial function
```

What if instead of a list of instructions for the computer, telling it to create two throw-away variables so that we can have a final value, we instead just write a sequence of actions?

``` haskell
yell = upper exclaim
```

This, is the core idea of our function above, it describes what we want, rather than how to do it.

These separate functions don't actually exist, so let's create them:

``` javascript
const upper = (str) => str.toUpperCase()
const exclaim = (str) => `${str}!`
```

Now, instead of the original function, we can say:

``` javascript
const yell = (str) => upper(exclaim(str))
```

There's still too much noise here for my liking. We can do better with a higher-order function `compose`:

``` javascript
const compose = (f, g) => (x) => f(g(x))

// or 

function compose(f, g) {
  return function(x) {
    return f(g(x))
  }
}
```

This lets us write

``` javascript
const yell = (str) => compose(upper, exclaim)(str)
```

But wrapping that in an anonymous function is unnecessary. This is actually identical to:


``` javascript
const yell = compose(upper, exclaim)
```

This expresses the idea much more concisely, and is much closer to our original idea that `yell = upper exclaim`.  
Compare:

``` javascript
const yell = (str) => {
  const upper = str.toUpperCase()
  const exclaim = `${upper}!`
  return exclaim
}
yell('hello world')

// vs.

const upper = (str) => str.toUpperCase()
const exclaim = (str) => `${str}!`
const yell = compose(exclaim, upper)
yell('hello world')

```

Not only is it shorter, but I find the signal-to-noise ratio is lower, and we have much more re-usable and *composable* code.

---

It might not be immediately obvious, but the order of evaluation in our compose function is right-to-left. If we look at both examples:

``` javascript
f(g(x)) === compose(f, g)(x)
```

`g(x)` will be the first thing evaluated, and its value will then be passed as the argument to `f()`.

When reading composed functions, it's important to remember that the input will first be given to the function on the right, and the return value will be from the function on the left.

This creates an annoying context shift for me, since usually we read left-to-right, top-to-bottom, fortunately, we can make a function that does left-to-right composition:

``` javascript
const pipe = (g, f) => (x) => f(g(x))
```

If it helps put things back in perspective:

``` javascript
f(g(x)) === compose(f, g)(x) === pipe(g, f)(x)
```

The benefits of these really shine with *variadic* implementations, so you can pass as many functions to be composed or piped as you like:

``` javascript
const id = (x) => x
const _compose = (f, g) => (x) => f(g(x))
const compose = (...fs) => fs.reduceRight(_compose, id)
const pipe = (...fs) => fs.reduce(_compose, id)

const objOf = curry((k, o) => ({ [k]: o }))
const tap = curry((f, v) => { f(v); return v })
const log = tap(console.log)

const myfn = pipe(
  upper,
  log,
  exclaim,
  log,
  objOf('yell'),
  log,
)
myfn('hello world')
```

---

One immediate benefit of using composed functions can be seen when used with `Array#map`.

If you've ever done

``` javascript
someList
  .map(e => someFn(e))
  .map(e => someOtherFn(e))
```

You're hopefully aware that this will iterate over the array twice, one for each `.map()`.

Using `pipe` we can cleanly do this in a single iteration:

``` javascript
someList
  .map(pipe(someFn, someOtherFn))
```

And since pipe is just a reverse `compose`, we can extend our knowledge of `map` such that:

``` javascript
l.map(f).map(g) === l.map(x => g(f(x))) === l.map(compose(g, f))
```
