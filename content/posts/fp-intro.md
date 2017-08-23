---
layout: post
title: "A small intro to functional programming"
category: computers
tags: [programming, javascript, php]
date: 2017/1/10
---

It seems there's some confusion on why you might use functional programming methods like map/reduce/filter, and so I thought I'd write this to try and explain why they're useful.

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

function sum($a) {
  return array_reduce($ints, add, 0); 
} 

echo sum($ints); // -> 10
```

The idea of `reduce` is that it takes some iterable (like an array), performs some computation with it, and then returns a single value from those computations.

A simple implementation of `reduce()` might be something like this:

``` php
function reduce($arr, $func, $initial) {
  $response = $initial;
  for($i = 0, $l = count($arr); $i < $l; ++$i) {
    $response = $func($response, $arr[$i]);
  }
  return $response;
}
```

The real magic is the fourth line: `$response = $func($response, $arr[$i]);`.
* At the beginning of the function, `$response` is initialized as a copy of the `$initial` argument.
* After every iteration, `$response` is re-assigned with the value of calling `$func()`. This calls the variable as a function.
* When it calls the function given to it, it sends the previous value of `$response` (since it has yet to actually be assigned) and the current element in the array as arguments to the given `$func` so they may be accessed inside of it.
* Then finally, `$response` is returned.

Here's the same code in JavaScript:

``` javascript
function reduce(arr, func, initial) {
  let response = initial;
  for (let i = 0, l = arr.length; i < l; ++i) {
    response = func(response, arr[i]);
  }
  return response;
}

function add(a, b) {
  return a + b;
}

function sum(array) {
  return reduce(array, add, 0);
}

sum([1, 2, 3, 4])  // -> 10
```

A function that takes another function as an argument (or returns another function) is a called a *Higher-Order Function*. Reduce is a higher-order function that "folds" a list of values into a single value.

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
  return reduce(arr, function(prev, curr) {
    return prev.concat(fn(curr)), []);
  }
}

// ES2015
const map = (arr, fn) =>
  reduce(arr, (prev, curr) =>
    prev.concat(fn(curr)), []);
```

# Filter

Filtering a list of values is perhaps the next useful task usually done with an array.

We can implement a `filter` function that iterates over the whole list, and returns a new list of values that only match a given function:

``` php
function filter($arr, $func) {
  return reduce($arr, function($previous, $current) use ($func, $arr) {
    if ($func($current, $arr)) {
      $previous[] = $current;
    }
    return $previous;
  }, []);
}

function isEven($n) {
  return $n % 2 == 0;
}

filter([1, 2, 3, 4, 5, 6], isEven) // -> [2, 4, 6]
```

The filter function could be implemented in JavaScript like this:

``` javascript
const filter = (array, callback) =>
  reduce((previous, current) =>
    callback(current, array)
      ? previous.concat(current)
      : previous,
    array)
```

---

I'm of the opinion unless you need to `break` or `continue` inside a loop, most use-cases of `for` to iterate over an array can usually be replaced with `map`, `reduce`, or `filter`, and get huge gains in readability.

If you're interested in learning more about functional programming, check out my post on [currying and partial application](/computers/fp-curry-pa)
