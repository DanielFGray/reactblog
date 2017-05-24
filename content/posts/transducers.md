---
layout: post
title: "Transducers Demystified"
category: computers
tags: [programming, javascript, php, unfinished]
date: 2017/1/10
---

# TODO: introduction
* FIXME: is transducers even the right term here?

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
echo $sum; //=> 10
```

While there's nothing particularly *wrong* with this (although I could nitpick a few things that bother me, namely re-calculating the length of the array before every iteration, and polluting scope with unnecessary variables), I just find it ugly.

Functional programming offers an alternative approach:

``` php
$sum = array_reduce($ints, function($previous, $current) {
  return $previous + $current;
}, 0);
echo $sum; //=> 10
```

The idea of `reduce` is that it takes an iterable (usually an array), performs some computation with it, and then returns a single value from those computations.

A simple implementation of `reduce()` might be something like this:

``` php
function reduce($arr, $func, $initial=null) {
  $response = $initial;
  for($i = 0, $l = count($arr); $i < $l; ++$i) {
    $response = $func($response, $arr[$i], $i);
  }
  return $response;
}
```

The real magic is the fourth line: `$response = $func($response, $arr[$i], $i);`.
* At the beginning of the function, `$response` is initialized as a copy of the `$initial` argument.
* After every iteration, `$response` is re-assigned with the value of calling `$func()`. This calls the variable as a function. If it's not a function it will error, you could do some error checking and test whether it is actually callable, which is what most implementations do.
* When it calls the function passed, it sends the previous value of `$response` (since it has yet to actually be assigned), the current element in the array, and the index of the element, to be passed as arguments to the given `$func` so they may be accessed inside function.
* Then finally, `$response` is returned.

Here's the same code in JavaScript:

``` javascript
function reduce(arr, func, initial) {
  let response = initial;
  for (let i = 0, l = arr.length; i < l; ++i) {
    response = func(response, arr[i], i);
  }
  return response;
};
```

The core of this idea, is that `reduce` is a function that expects a function as an argument (although in the above examples they only assume as much, since there's no type checking), and it then calls that given function inside the `reduce` function. A function that takes another function as an argument is a called a *Higher-Order Function*.

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
echo join(', ', $ints); //=> 1, 4, 9, 16
```

In functional programming, when you want to iterate over a set and transform it, you would use `map`.

``` php
$ints = [1, 2, 3, 4];
$squared = array_map(function($current) {
  return $current * $current;
}, $ints);
echo join(', ', $ints); //=> 1, 4, 9, 16
```

This is much tidier, in my opinion. When you see that big messy `for` loop, you have no idea what's going on until you fully read the whole thing and attempt to mentally parse it. When you see `map`, without reading anything but that word, you immediately know that you are creating a copy of an array and changing all the values based on a given function.

You could implement `map` like the following:

``` php
function map($arr, $func) {
  $response = $arr;
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
echo join(', ', $squared); //=> 1, 4, 9, 16
```

It works just as expected!

In fact, you can write `map` as just a wrapper around reduce:

``` php
function map($arr, $func) {
  return reduce($arr, function($previous, $current, $index) use ($func) {
    $previous[] = $func($current, $index);
    return $previous;
  }, []);
}
```

Or, in JavaScript:

``` javascript
// ES5
const map = function(array, func) {
  return reduce(array, function(previous, current, index) {
    return previous.concat(func(current, index)), []);
  }
}

// ES2015
const map = (arr, fn) =>
  reduce(arr, (a, c, i) =>
    a.concat(fn(c, i)), []);
```

# Filter

* TODO

``` php
function filter($arr, $func) {
  return reduce($arr, function($previous, $current, $index) use ($func, $arr) {
    if ($func($current, $arr, $index)) {
      $previous[] = $current;
    }
    return $previous;
  }, []);
}
```

``` javascript
const filter = (array, callback) => {
  return reduce(array,(previous, current, index) =>  {
    if (callback(current, array, index)) {
      return previous.concat(current);
    } else {
      return previous;
    }
  }
}
```

# TODO: Terminology

* Reduce is aka *fold*, which means JavaScript arrays are *foldable*
* arrays in JavaScript and PHP are *functors* because they are mappable
