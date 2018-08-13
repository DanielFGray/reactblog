---
layout: post
title: 'Functional Programming: currying and partial application'
category: computers
tags: [programming, javascript, fp]
date: 2017/08/23
---

An explanation of currying and partial application using JavaScript

---

Let's start with a simple function that takes two numbers and adds them together:

``` javascript
const add = function (a, b) {
  return a + b
}
add(1, 2) //-> 3
```

Now, instead of a single function that takes two arguments and returns a value, I'm going to rewrite this so that `add` is a function that takes a single argument, and returns another function which accepts a single argument, and then returns the sum of both arguments:

``` javascript
const add = function (a) {
  return function(b) { 
    return a + b
  }
}
add(1)(2) //-> 3
```

To make this a bit tidier, the same can be written with fat arrow functions:

``` javascript
const add = a => b => a + b
add(1)(2) //-> 3
```

Taking a function that accepts multiple values, and transforming it to a 'stream' of functions that each only accept a single argument is called *currying*.

---

Writing functions in this style is a bit tedious though. We can write a higher-order function `curry` that will take a function that accepts multiple arguments, and return a curried version of that function:

``` javascript
const curry = func => {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}
```

Now instead of manually nesting our `add` function we can simply:

``` javascript
const add = curry((a, b) => a + b)
add(1) //-> [Function]
add(1, 2) //-> 3
```

---

Why go through all this trouble? Well, imagine you want to write another function that increments a number by one:

``` javascript
const inc = n => 1 + n
inc(2) //-> 3
```

This would work, but it's very similar to the `add` function we already wrote. Using the curried version of `add` above, writing an `inc` function becomes as simple as:

``` javascript
const inc = add(1)
inc(2) //-> 3
```

Taking a curried function and supplying less arguments than it expects is called *partial application*. 

---

In [a previous post](../fp-intro) I talked about re-implementing `reduce`. Here's that `reduce` function, but wrapped with `curry`:

``` javascript
const reduce = curry((fn, init, arr) => {
  let response = init
  for (let i = 0, l = arr.length; i < l; ++i) {
    response = fn(response, arr[i])
  }
  return response
})
```

With this, we can take our `add` function from earlier, and create a `sum` function that adds all the numbers in an array:

```
const sum = reduce(add, 0)
sum([1, 2, 3]) //-> 6
```

---

These are fairly boring things to curry, so I'll share a fun example of currying I used recently.

I wanted to write a script that would send multiple requests to different sites, pulling in data from a lot of places, possibly sending muliple requests to each site, and all of the requests needed to have API keys with each call.

There are tons of libraries that handle making requests but none of them have a curried version. Here's a thin wrapper around *[SuperAgent][superagent]*

[superagent]: https://visionmedia.github.io/superagent

``` javascript
const prop = curry((key, o) => o[key])
const request = curry((base, header, method, endpoint, data = {}) => {
  return Promise.try(() => prop(method, {
    post: superagent(method, `${base}${endpoint}`).set(header).send(data),
    get: superagent(method, `${base}${endpoint}`).set(header).query(data),
  }))
  .then(prop(body))
}
const gitHub = request('https://api.github.com/', { Authorization: `token ${myGitHub.key}` })
const gitLab = request('https://gitlab.com/api/v4/', { 'PRIVATE-TOKEN': myGitLab.key })

gitHub('get', 'search/repositories', { q: `user:${myGitHub.user}` })
  .then(console.log)
gitLab('get', `users/${myGitLab.user}/projects`)
  .then(console.log)
```

Instead of making separate functions that would almost be duplicates with only slight variations, I create one function and partially apply it with the base URL and Auth headers, so that I can re-use those for different end-points of the API and add arbitrary data to those.
