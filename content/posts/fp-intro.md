---
layout: post
title: "Functional Programming: a small introduction"
category: computers
tags: [programming, javascript, fp]
date: 2017/1/10
---

It seems there's some confusion on why you might use functional programming methods like map/reduce/filter, and so I thought I'd write this to try and explain why they're useful.

---

# Reduce

Imagine you have an array of numbers, and you want to sum them.

The common imperative approach is usually something like this:

``` javascript
var ints = [1, 2, 3, 4];
var sum = 0;
for (var i = 0; i < count(ints); i++) {
  sum += ints[i];
}
echo sum; // -> 10
```

Functional programming offers an alternative approach:

``` javascript
function add(a, b) {
  return a + b;
}

function sum(a) {
  return array_reduce(ints, add, 0);
}

echo sum(ints); // -> 10
```

I think about reduce as a way to join many values into a single value, while explaining how to merge one at a time.

A simple implementation of `reduce()` might be something like this:

The real magic is the fourth line: `response = func(response, arr[i]);`.
* At the beginning of the function, `response` is initialized as a copy of the `initial` argument.
* Every iteration, `response` is re-assigned with the value of calling `func(response)`. This *calls* the variable as a function.
* When it calls the function given to it, it sends the previous value of `response` (or the initial value if it's the first iteration), and the current element in the array, as arguments to the given `func` so they may be accessed inside the given function when it's called.
* Then finally, last `response` is returned.

Here's the same code in JavaScript:

``` JavaScript
function reduce(func, initial, arr) {
  let response = initial
  for (let i = 0, l = arr.length; i < l; ++i) {
    response = func(response, arr[i])
  }
  return response
}

function add(a, b) {
  return a + b
}

function sum(array) {
  return reduce(add, 0, array)
}

sum([1, 2, 3, 4])  // -> 10
```

A function that takes another function as an argument (or returns another function) is a called a *Higher-Order Function*. *reduce* is a higher-order function that "folds" a list of values into a single value.

---

[Eloquent JavaScript][eloquent] has [an exercise][exercise] where they ask the reader to turn a simple array into a nested object, such that:

[eloquent]: http://eloquentjavascript.net/
[exercise]: http://eloquentjavascript.net/04_data.html

``` JavaScript
const array = [1, 2, 3]
```

becomes

``` JavaScript
const nested = {
  value: 1,
  rest: {
    value: 2,
    rest: {
      value: 3,
      rest: null
    }
  }
}
```

There are a number of ways to solve this, but here is my approach:

``` JavaScript
[1, 2, 3]
  .reduceRight(function(accumulated, current) {
    return ({
      value: current,
      rest: accumulated,
    })
  }, null)
```

`reduceRight` is the same as reduce except it starts at the end of the array, and works backwards.

---

Even though JavaScript is weakly typed, analyzing the type signatures of functions can still yield valuable information about how a function works.

The type of functions used in *reducers* is  `a b -> a`, that is, a function that takes two arguments and returns a value that's the same type as the first argument.  
`reduce` is a function with the signature  `(a b -> a) a [b] -> a`, it accepts a reducer function, a thing `a`, a list of `b`, and returns a thing the same type of `a`.

I should note that these are *imperative* solutions, *recursive* solutions are more typical in functional approaches.

``` JavaScript
function reduce (fn, i, l) {
  return l.length === 0
    ? i
    : reduce(fn, fn(i, l[0]), l.slice(1))
}
```

# Map

But reducing an array to a single value is only one of many things programmers do with arrays.

What if you wanted to transform each element? Maybe you have an array of numbers and you want to multiply them all by themselves?

The imperative approach might be something like:

``` javascript
var ints = [1, 2, 3, 4];
var squared = [];
for(var i = 0, length = ints.length; i < length; ++i) {
  squared.push(ints[i] * ints[i]);
}
ints // -> [1, 4, 9, 16]
```

In functional programming, when you want to iterate over a set and transform it, you would use `map`.

``` javascript
function square(n) {
  return n * n;
}

[1, 2, 3, 4].map(square); // -> [1, 4, 9, 16]
```

This is much tidier, in my opinion. When you see that big messy `for` loop, you have no idea what's going on until you fully read the whole thing and attempt to mentally parse it. When you see `map`, without reading anything but that word, you immediately know that you are creating a new array with all of the values changed by a given function.

---

`map` has a type signature of `(a -> b) [a] -> [b]`, it's a function that receives a function of type `a` which returns a thing of type `b` when given a list of `a`, and then returns a list of `b`s.

---

You could implement `map` like the following:

``` javascript
function map(func, arr) {
  var state = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    state.push(func(arr[i]))
  }
  return state;
}
```

It follows much the same pattern as the `reduce` function. In fact, they're almost identical...

If you recall, `reduce` always returns a single value. Well, an array, although it contains many items, is itself a single value. What if you give `reduce` an empty array as the initial value, and add to that array instead?

``` javascript
var ints = [1, 2, 3, 4];
squared = ints.reduce(function(previous, current) {
  previous.push(current * current)
  return previous;
}, []);
squared // -> [1, 4, 9, 16]
```

It works just as expected!

In fact, you can write `map` as just a wrapper around reduce:

``` javascript
const map = (fn, arr) => {
  return reduce((prev, curr) => {
    prev.push([fn(curr)])
    return prev
  }), [], arr)
}

// ES2015
const map = (fn, a) =>
  reduce((prev, curr) => {
    prev.push([fn(curr)])
    return prev
  }), [], a)
```

If your map function returns another array, you can even "un-nest" or flatten the arrays into a single array:
t
``` JavaScript
const flatMap = (fn, a) =>
  reduce((p, c) => p.concat(c), [], a)
```


# Filter

Filtering a list of values is another useful task to be done with an array.

We can implement a `filter` function that iterates over the whole list, and returns a new list of values that only match a given function:

``` JavaScript
const filter = (fn, a) =>
  reduce((p, c) => {
    if (fn(c)) {
      return p.concat([c])
    }
    return p
  }), [], a)
```

## Partiton

A slight twist on filter, this splits an array into two arrays whether they match a predicate function:

``` JavaScript
const partition = (fn, a) =>
  reduce(([t, f], c) => {
    if (fn(c)) {
      return [t.concat([c]), f]
    }
    return [t, f.concat([c])]
  }), [[], []], a)

const isEven = n => n % 2 === 0
partition(isEven, [1, 2, 3, 4]) // -> [[2, 4], [1, 3]]
```

---

I'm of the opinion unless you need to `break` or `continue` inside a loop, most use-cases of `for` to iterate over an array can usually be replaced with a higher order function like `reduce`, and get huge gains in readability.

If you know that map operates on a function and an array, and you see the following, which one takes you longer to read and understand what it does?

``` JavaScript
const items = [{
  foo: 'a',
  bar: 1,
}, {
  foo: 'b',
  bar: 2,
}]

// functional
const newList = items.map(e => e.foo)

// imperative
const newList = []
for (let i = 0; i < items.length; i++) {
  newList.push(items[i].foo)
}
```


There are optimizations that could be performed in the imperative approach, and those types of optimizations are not the kind I like working on. Using `reduce` I can abstract away the details of iterating over an array with much less typing, and move the optimizations to a single point.

# Helper functions

That example above, taking an array of objects and retrieving the value of a particular properties from each one, is a common enough pattern that I'd like to make a special function for it:

``` JavaScript
const prop = a => b => b[a]
items.map(prop('foo'))
```

I can take this another step further and make a function specifically for retrieving values from an array of objects:

``` JavaScript
const pluck = (a, b) => b.map(prop(a))
pluck('foo', items)
```

> If you're interested in learning more about functional programming, check out my post on [currying and partial application](./fp-curry-pa)
