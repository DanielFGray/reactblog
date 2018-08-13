---
layout: post
title: "An Attempt At Explaining Category Theory "
category: computers
tags: [programming, javascript, fp]
date: 2018-1-4
---

This is mostly a personal notebook of what I think I have learned. I make no guarantee about the accuracy of anything said here, I would appreciate any corrections or feedback on anything [I've ever] posted.

# Introduction

The study of mathematical categories is similar a taxonomy, in that it is concerned with naming things that fit specific properties. /* fixme */


# Types

This article uses an ML-like notation for types described by the [Fantasy Land Spec][FLSpec].

The Fantasy Land  also shortening `SomeObject.prototype.someMethod` by writing `SomeObject#someMethod`.

A unary function (a function that takes one parameter) named `f` that returns a value of the same type it's given would be notated as:

``` haskell
f :: a -> a
```

The `::` can be read as "has the type of", or from a categories point-of-view, "is a member of".

`a` here is a *type variable*, it's value can be anything, we just named it `a`.

The `->` symbol is much like the arrow function syntax in JavaScript, it represents a function whose parameters are the thing to the left, and it returns a thing of the type to the right.

Consider this function `id`, which just returns whatever is given to it:

``` javascript
// id :: a -> a
const id = a => a
```

If this function *might* provide a different type than given, it would be notated as:

``` haskell
f :: a -> b
```

Type signatures can impose [constraints][typeconstraints] on what inputs they accept:

``` haskell
toUpper :: String s => s -> s
```

The `=>` represents the type constraint over the following function, using the variable `s` to name it. 

---

Here is a binary function (a function that takes two parameters) named `g` that accepts two different values, and returns a value the same type as the second:

```
g :: a b -> b
```

If the function is [curried][currying], it would be notated as:

``` haskell
g :: a -> b -> b
```

Functions passed to `Array#reduce` are of this same type.

```
reduce :: [a] ~> (a b -> b) b -> b
```

The `~>` represents the value of `this` being the array of `a`s being implicitly passed to the function.

Here's the curried version from Ramda:

``` haskell
reduce :: (a -> b -> b) -> b -> [a] -> b
```

## Exercise

* Write type signatures for 10 functions you commonly use

---

# Groupoids and semigroupds

* groupoids are the category of things with a binary operation
* semigroups are groupoids with associativity
* monoids are semigroups with an identity element

# Monoid

Monoids are the category of things which have:

* some binary function, operator, or operation, of the type `a a -> a`. It takes two things of the same type and returns something of the same type.
* an *identity* or "empty" value of that same category that when used in that function has no effect on the other value.

## Examples

Numbers form a monoid, using addition and the number 0, and also using multiplication and the number 1:

``` javascript
const add = (a, b) => a + b
const multiply = (a, b) => a * b

// adding or multiplying two numbers together yields a new number
add(5, 5) //-> 10
multiply(5, 5) //-> 25
// adding or multiplying a number by it's identity value yields that same number
add(10, 0) //-> 10
multiply(10, 1) //-> 10
// 
```

Strings form a monoid via concatenation and an empty string:

``` javascript
const join = (a, b) => `${a}${b}`
// or
const join = (a, b) => a.concat(b)
join('hello', 'world') //-> 'helloworld'
join('testing', '') //-> 'testing'
```

Arrays fall into this category as well:

``` javascript
const concat = (a, b) => [...a, ...b]
// or
const concat = (a, b) => a.concat(b)
concat(['test'], ['world']) //-> ['hello', 'world']
concat(['test'], []) //-> ['test']
```

The last example, and my personal favorite, is functions:

``` javascript
const id = a => a
const toUpper = s => s.toUpperCase()
const exclaim = s => `${s}!`
const compose = (f, g) => (x) => f(g(x))
compose(exclaim, id)('test') //-> 'test!'
compose(exclaim, toUpper)('test') //-> 'TEST!'
```

All of these functions have the same type:

``` haskell
f :: a a -> a
```

Knowing that a thing falls in the category of monoids yields valuable insights. For instance, instead of composing only two elements, we can compose any number of them:

``` javascript
// listOfThings.reduce(binaryOperation, identityValue)

const sum     = (...ns) => ns.reduce((a, b) => a + b, 0)
const append  = (...ss) => ss.reduce((a, b) => `${a}${b}`, '')
const concat  = (...as) => as.reduce((a, b) => [...a, ...b], [])
const compose = (...fs) => fs.reduce((a, b) => (x) => a(b(x)), a => a)
```

We could try to write a generic concat function:

# Functors

Functors are things that provide *mappings* to other things. Functors let you describe transformations, or *morphisms* (sometimes more formally *homomorphisms*), from category `A` to category `B`.

A functor must obey a few simple laws:

* A functor must preserve identity

  Calling this map function with the identity function `x => x` should return the same input as given. In other words, `map` has no other effect on the input besides calling the given function on it.

``` javascript
[1, 2, 3].map(x => x) //-> [1, 2, 3]
```

* A functor must preserve composition

  Given the `compose` function above, this is best explained by saying

``` javascript
const increment = x => x + 1
const square = x => x * x
[1, 2, 3].map(increment).map(square)
```

  returns the same thing as

``` javascript
const compose = (f, g) = x => f(g(x))
[1, 2, 3].map(compose(square, increment))
```

As a result of these two functor laws, it can be said that

* A functor must preserve structure

  A map function should return a result of the same structure as given to it. With arrays, this is done by making sure the length of the list remains the same, and that the transformation of each item can be represented via the same index (and not in reverse or some other order).

  One can also create a map function that operates on objects as well as arrays:

``` javascript
const type = val => Object.prototype.toString.call(val).slice(8, -1)
const map = (fn, functor) => {
  const t = type(functor)
  if (t === 'Array') {
    return functor.map(fn)
  } else if (t === 'Object') {
    return Object.entries(functor)
      .reduce((p, [k, v]) => ({
        ...p,
        [k]: fn(v),
      }), {})
  }
  throw new Error(`expected a functor, recieved: ${t}`)
}

map(x => x + 1, { a: 1, b: 2 }) //-> { a: 2, b: 3 }
map(x => x + 1, [1, 2]) //-> [2, 3]
```

  Note that the given function only operates on the values of the object, and new object still maintains the same keys, hence preserving the structure of the original object.

So we've shown that arrays and objects (or lists and dictionaries, if you prefer) can be functors. Another way of thinking about functors, is that they are containers, 

# Endofunctors

Endofunctors are a specific kind of functor whose map function always returns a type of itself.

Let's create an object called Identity, which will behave like a container that lets us `map` over its value:

``` javascript
const Identity = function(value) { this.__value = value }
Identity.of = function (value) { return new Identity(value) }
Identity.prototype.map = function (fn) { return Identity.of(fn(this.__value)) }
```

I also included an `.of` method (a factory function, if you like) that lets us create new `Identity`s without the `new` keyword:

``` javascript
Identity.of('test') //-> Identity { __value: 'test' }
```

We can `.map` over this value:

``` javascript
Identity.of('test').map(x => x.toUpperCase()) //-> Identity { __value: 'TEST' }
```

and no matter what we do, we always get an instance of Identity. This makes our Identity object an Endofunctor.

This may sound rather contrived, but try and think of an example where mapping an array doesn't return another array, or using our map function above, wouldn't return another object if given one.

In programming it's usually pretty safe to assume a functor will behave like an endofunctor.

# Monads

> A monad is a monoid in the category of endofunctors

This is an often quoted definition of monads, but it's very terse and doesn't really explain much.

We've covered both monoids and endofunctors, and according to the above definition, monads inherit properties from both of them:

* A monad has some operation that takes two monads of the same type and returns another monad of the same type
* ...  has an identity or empty value of the monad which returns the original monad when used in the above function
* ...  always returns an instance of itself

So let's take our Identity function from earlier and extend it into a monad.

> ...to be continued

[FLSpec]: https://github.com/fantasyland/fantasy-land#type-signature-notation
[typeconstraints]: #TODO
[currying]: #TODO
