---
layout: post
title: "A small intro to functional programming"
category: computers
tags: [programming, javascript, php]
date: 2017/1/10
---

What's a functor anyway?

---

# Reduce

Imagine you have an array of numbers, and you want to sum them.

The common imperative approach (here in PHP) is usually something like this:

``` php
$ints = [1, 2, 3, 4];
$sum = 0;
for ($i = 0; $i < count($ints); $i++) {
  $ints[$i] += $sum;
}
echo $sum; // -> 10
```

While there's nothing particularly *wrong* with this (although I could nitpick a few things that bother me, namely re-calculating the length of the array before every iteration, and polluting scope with unnecessary variables), I just find it ugly.

Functional programming offers an alternative approach:

``` php
function add($a, $b) {
  return $a + $b;
}
$sum = array_reduce($ints, add, 0);
echo $sum; // -> 10
```

The idea of `reduce` is that it takes an iterable (usually an array) an initial value, performs some computation with it, and then returns a single value from those computations.

A simple implementation of `reduce()` might be something like this:

``` php
function reduce($func, $arr, $initial) {
  $response = $initial;
  for($i = 0, $l = count($arr); $i < $l; ++$i) {
    $response = $func($response, $arr[$i]);
  }
  return $response;
}

reduce(function(a, b) { return a + b; }, [1, 2, 3, 4], 0) // -> 10
```

The real magic is the fourth line: `$response = $func($response, $arr[$i], $i);`.
* At the beginning of the function, `$response` is initialized as a copy of the `$initial` argument.
* After every iteration, `$response` is re-assigned with the value of calling `$func()`. This calls the variable as a function.
* When it calls the function given to it, it sends the previous value of `$response` (since it has yet to actually be assigned) and the current element in the array as arguments to the given `$func` so they may be accessed inside of it.
* Then finally, `$response` is returned.

Here's the same code in JavaScript:

``` javascript
function reduce(func, arr, initial) {
  let response = initial;
  for (let i = 0, l = arr.length; i < l; ++i) {
    response = func(response, arr[i]);
  }
  return response;
}

reduce((a, b) => a + b, [1, 2, 3, 4], 0)  // -> 10
```

A function that takes another function as an argument (or returns another function) is a called a *Higher-Order Function*. Reduce is a higher-order function that "folds" a list of values into a single value, by passing a callback function the previous value of 

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
echo join(', ', $ints); // -> 1, 4, 9, 16
```

In functional programming, when you want to iterate over a set and transform it, you would use `map`.

``` php
function square($n) {
  return $n * $n;
}
$ints = [1, 2, 3, 4];
$squared = array_map(square, $ints);
echo join(', ', $ints); // -> 1, 4, 9, 16
```

This is much tidier, in my opinion. When you see that big messy `for` loop, you have no idea what's going on until you fully read the whole thing and attempt to mentally parse it. When you see `map`, without reading anything but that word, you immediately know that you are creating a copy of an array and changing all the values based on a given function.

You could implement `map` like the following:

``` php
function map($func, $arr) {
  $response = array_clone($arr);
  for ($i = 0, $l = count($response); $i < $l; ++$i) {
    $response[i] = func($response[i], $i);
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
function map($arr, $func) {
  return reduce($arr, function($previous, $current) use ($func) {
    $previous[] = $func($current);
    return $previous;
  }, []);
}
```

Or, in JavaScript:

``` javascript
// ES5
function map(arr, fn) {
  return reduce(arr, function(p, c) {
    return p.concat(fn(c)), []);
  }
}

// ES2015
const map = (arr, fn) =>
  reduce(arr, (p, c) =>
    p.concat(fn(c)), []);
```

# Filter

* TODO

``` php
function filter($arr, $func) {
  return reduce($arr, function($previous, $current) use ($func, $arr) {
    if ($func($current, $arr)) {
      $previous[] = $current;
    }
    return $previous;
  }, []);
}
```

``` javascript
const filter = (array, callback) =>
  reduce((previous, current) =>
    callback(current, array)
      ? previous.concat(current)
      : previous,
    array)
```

# TODO: Terminology

* Reduce is aka *fold*, which means JavaScript arrays are *foldable*
* arrays in JavaScript and PHP are *functors* because they are mappable
