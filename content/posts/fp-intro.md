---
layout: post
title: "Functional Programming: a small introduction"
category: computers
tags: [programming, javascript, php, fp]
date: 2017/1/10
---

It seems there's some confusion on why you might use functional programming methods like map/reduce/filter, and so I thought I'd write this to try and explain why they're useful.

---

# Reduce

Imagine you have an array of numbers, and you want to sum them.

The common imperative approach is usually something like this:

``` php
$ints = [1, 2, 3, 4];
$sum = 0;
for ($i = 0; $i < count($ints); $i++) {
  $ints[$i] += $sum;
}
echo $sum; // -> 10
```

While there's nothing particularly *wrong* with this (although I could nitpick a few things that bother me, like re-calculating the length of the array before every iteration, and polluting scope with unnecessary variables), I just find it ugly.

Functional programming offers an alternative approach:

``` php
function add($a, $b) {
  return $a + $b;
}

function sum($a) {
  return array_reduce($a, add, 0);
}

echo sum([1, 2, 3, 4]); // -> 10
```

The idea of `reduce` (aka fold, or fold-left) is that it takes some iterable (like an array), performs some computation with it, and then returns a single value from those computations.

A simple implementation of `reduce()` might be something like this:

``` php
function reduce($func, $initial, $arr) {
  $response = $initial;
  for($i = 0, $l = count($arr); $i < $l; ++$i) {
    $response = $func($response, $arr[$i]);
  }
  return $response;
}
```

The real magic is the fourth line: `$response = $func($response, $arr[$i]);`.
* At the beginning of the function, `$response` is initialized as a copy of the `$initial` argument.
* Every iteration, `$response` is re-assigned with the value of calling `$func($response)`. This *calls* the variable as a function.
* When it calls the function given to it, it sends the previous value of `$response` (or the initial value if it's the first iteration), and the current element in the array, as arguments to the given `$func` so they may be accessed inside it when it's called.
* Then finally, the last `$response` value is returned.

Here's the same code in JavaScript:

``` javascript
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

function sum(a) {
  return reduce(add, 0, a)
}

sum([1, 2, 3, 4])  // -> 10
```

A function that takes another function as an argument (or returns another function) is a called a *Higher-Order Function*. *reduce* is a higher-order function that "folds" a list of values into a single value.

---

Summing numbers is a pretty trivial thing, so how about something more practical?

[Eloquent JavaScript][eloquent] has [an exercise][exercise] where they ask the reader to turn a simple array into a nested object, such that:

[eloquent]: http://eloquentjavascript.net/
[exercise]: http://eloquentjavascript.net/04_data.html

``` javascript
const array = [1, 2, 3]
```

becomes

``` javascript
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

There are a number of ways to solve this (in fact, don't let this section be a spoiler, try and solve this on your own first), but here is my approach:

``` javascript
[1, 2, 3]
  .reduceRight(function(prev, cur) {
    return {
      value: cur,
      rest: prev
    }
  }, null)
```

`reduceRight` works similar to reduce, except it starts at the end of the array, and works backwards.

---

Even though JavaScript is weakly typed, analyzing the type signatures of functions can still yield valuable information about how a function works.

The type of functions used in *reducers* is  `a b -> a`, that is, a function that takes two arguments and returns a value that's the same type as the first argument.  
This means that `reduce` is a function with the signature  `(a b -> a) a [b] -> a`, it accepts a reducer function, a thing `a`, a list of `b`, and returns a thing the same type of `a`.

I should note that these are *imperative* solutions, *recursive* solutions are more typical in functional approaches.

``` javascript
function reduce (fn, i, l) {
  return l.length === 0
    ? i
    : reduce(fn, fn(i, l[0]), l.slice(1))
}
```

# Map

But reducing an array to a single value is only one of many things programmers do with arrays.

What if you wanted to transform each element? Maybe you have an array of numbers and you want to multiply them all by themselves?

The imperative approach (again in PHP) might be something like:

``` php
$ints = [1, 2, 3, 4];
$squared = [];
for($i = 0, $length = count($ints); $i < $length; ++$i) {
  $squared[] = $ints[$i] * $ints[$i];
}
echo join(', ', $ints); // -> '1, 4, 9, 16'
```

In functional programming, when you want to iterate over a set and transform it, you would use `map`.

``` php
function square($n) {
  return $n * $n;
}

array_map(square, [1, 2, 3, 4]); // -> 1, 4, 9, 16
```

This is much tidier, in my opinion. When you see that big messy `for` loop, you have no idea what's going on until you fully read the whole thing and attempt to mentally parse it. When you see `map`, without reading anything but that word, you immediately know that you are creating a new array with all of the values changed by a given function.

---

`map` has a type signature of `(a -> b) [a] -> [b]`, it's a function that receives a function of type `a` which returns a thing of type `b` when given a list of `a`, and then returns a list of `b`s.

That `map` can return a list of a different type is a key insight. Another example of using `map` could be to take an array of objects, and return an array of strings:

``` javascript
var o = [{a: 'foo'}, {a: 'bar'}]
o.map(function(e) { return "a: '" + e.a + "'" })
// -> ["a: 'foo'", "a: 'bar'"]
```

---

You could implement `map` like the following:

``` php
function map($func, $arr) {
  $response = [];
  for ($i = 0, $l = count($response); $i < $l; ++$i) {
    $response[] = func($arr[i]);
  }
  return $response;
}
```

It follows much the same pattern as the `reduce` function. In fact, they're almost identical...

If you recall, `reduce` always returns a single value. Well, an array, although it contains many items, is itself a single value. What if you give `reduce` an empty array as the initial value, and add to that array instead?

``` php
$ints = [1, 2, 3, 4];
$squared = array_reduce($ints, function($previous, $current) {
  $previous[] = $current * $current;
  return $previous;
}, []);
echo join(', ', $squared); // -> 1, 4, 9, 16
```

It works just as expected!

In fact, you can write `map` as just a wrapper around reduce:

``` php
function map($func, $arr) {
  return reduce(function($previous, $current) use ($func) { // use ($variable) is needed because PHP has strange scoping rules
    $previous[] = $func($current);
    return $previous;
  }, [], $arr);
}
```

Or, in JavaScript:

``` javascript
// ES5
function map(fn, a) {
  return reduce(function(prev, curr) {
    prev.push(fn(curr))
    return prev
  }), [], a)
}

// ES2015
const map = (fn, a) =>
  reduce((prev, curr) => {
    prev.push(fn(curr))
    return prev
  }), [], a)
```

# Filter

Filtering a list of values is another useful task to be done with an array.

We can implement a `filter` function that iterates over the whole list, and returns a new list of values that only match a given function:

``` php
function filter($func, $arr) {
  return reduce(function($prev, $curr) use ($func) {
    if ($func($curr)) {
      $prev[] = $curr;
    }
    return $prev;
  }, [], $arr);
}

function isEven($n) {
  return $n % 2 == 0;
}

filter(isEven, [1, 2, 3, 4, 5, 6]) // -> [2, 4, 6]
```

The same thing in JavaScript, using arrow functions a ternary conditional:

``` javascript
const filter = (fn, a) =>
  reduce((p, c) =>
    fn(c) ? p.concat([c]) : p), [], a)

const isEven = n => n % 2 === 0
filter(isEven, [1, 2, 3, 4, 5, 6]) // -> [2, 4, 6]
```

---

I'm of the opinion unless you need to `break` or `continue` inside a loop, most use-cases of `for` to iterate over an array can usually be replaced with `map`, `reduce`, or `filter`, and get huge gains in readability.

If you know that map operates on a function and an array, and you see the following, which one takes you longer to read and understand what it does?

``` javascript
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


There are optimizations that could be performed in the imperative approach, and those types of optimizations are not the kind I like working on. I can abstract away the details of iterating and retrieving a list of keys in a collection using `map`, which has the same effect, and is much less typing, and moves the optimizations to the original implementation.

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

> If you're interested in learning more about functional programming, check out my post on [currying and partial application](../fp-curry-pa)
