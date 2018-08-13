---
layout: post
title: "Async Programming in Node.js"
category: computers
tags: [javascript,nodejs,programming]
date: 2018-06-07
---

Callbacks, Promises, Async/Await (oh my!)

# Callbacks

When Node.js was first introduced, it shipped a pattern of dealing with I/O that was very callback-heavy:

``` javascript
var fs = require('fs')

var file = './fileName'
const data = {a: 1}
fs.writeFile(file, JSON.stringify(), 'utf8', function(e) {
  if(e) { throw new Error('error writing file:', e) }
  console.log('done writing')
})

fs.readFile(file, 'utf8', function(e, content) {
  if(e) { throw new Error('error reading file:', e) }
  console.log(content)
})
```

At first glance, you may not notice anything wrong, but this introduces a race condition. `fs.readFile` and `fs.writeFile` are `asynchronous`, which means they don't block JavaScript's [event loop][eventloop]. This has the effect that both writing and reading happens nearly instantly, and it's possible that writing may take longer than the time it takes for reading to start.

To make sure that reading doesn't happen until after writing has occurred, many opted to nest their callbacks:

``` javascript
var fs = require('fs')

var file = './fileName'

var number = Math.random()

fs.writeFile(file, JSON.stringify({a:1}), 'utf8', function(e) {
  if(e) { throw new Error('error writing file:', e) }
  console.log('done writing')
  fs.readFile(file, 'utf8', function(e, content) {
    if(e) { throw new Error('error reading file:', e) }
    console.log(content)
  })
})
```

If you imagine a series of many more asynchronous actions happening after each other, introducing many levels of nesting, you can hopefully see why this becomes very awkward to deal with.

# Promises

Promises are one attempt to solve this problem. They provide a chainable API which makes it easy to describe a sequence of actions in a more linear manner (ie without all the nesting).

``` javascript
const fs = require('fs')
const { promisify } = require('util')

const file = './fileName'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const data = {a: 1}
writeFile(file, JSON.stringify(data), 'utf8')
  .catch(e => throw new Error('error writing file:', e))
  .then(() => console.log('done writing'))
  .then(() => readFile(file, 'utf8'))
  .catch(e => throw new Error('error reading file:', e))
  .then(content => console.log(content))
```

The flow is more linear, there's no nesting, instead we're just defining some functions for what to do at each step.

To take it one step further, let's get the file size after writing as well:

``` javascript
const fs = require('fs')
const { promisify } = require('util')

const file = './fileName'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const statFile = promisify(fs.stat)

writeFile(file, JSON.stringify({a:1}), 'utf8')
  .catch(e => throw new Error('error writing file:', e))
  .then(() => console.log('done writing'))
  .then(() => statFile(file))
  .catch(e => throw new Error('could not stat file:', e))
  .then(stats => console.log('file is', stats.size, 'bytes'))
  .then(() => readFile(file, 'utf8'))
  .catch(e => throw new Error('error reading file:', e))
  .then(contents => console.log(contents))
```

This is definitely an improvement over nesting, but to be honest, it's not great. The whole affair feels very alien, and what if you want to combine the output from `readFile` and `statFile` into a new object?

To take a step back from all of this and compare, here's the same idea, but using the synchronous versions of `read`, `write`, `stat`:

``` javascript
var fs = require('fs')

var file = './fileName'
var data = {a:1}

fs.writeFileSync(file, JSON.stringify(data), 'utf8')
console.log('done writing')
var stats = fs.statSync(file)
var size = stats.size
var contents = fs.readFileSync(file, 'utf8')
console.log({ file: file, size: size, contents: contents })
```

If this were just a one-off script for personal use, you could ignore the problems of synchronous code. If you were hosting a web server, other users accessing the server would be waiting on network requests while files were being read, because synchronous code blocks the entire process from doing anything else.

# Async/Await

Here's one way to write that code using async/await:

``` javascript
import fs from 'fs'
import { promisify } = require('util')

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const statFile = promisify(fs.stat)

const file = './fileName'
const data = {a:1}

// i've ignored error handling for now
const writeFiles = async (file, data) => {
  await writeFile(file, JSON.stringify(data), 'utf8')
  console.log('done writing')
  const stats = await statFile(file)
  const size = stats.size
  const contents = await readFile(file, 'utf8')
  console.log({ file, size, contents })
}
writeFiles(file, data)
```

The difference is almost entirely just a case of wrapping the block in a function, removing the `Sync` suffix from each function, and prepending the `await` keyword to it.

You can translate this back into promises:

``` javascript
const fs = require('fs')
const { promisify } = require('util')

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const statFile = promisify(fs.stat)

const writeFile = (file, data) =>
  writeFile(file, JSON.stringify(data), 'utf8')
    .then(() => {
      console.log('done writing')
      return statFile(file)
    }) 
    .then(stats => {
      const size = stats.size
      return readFile(file, 'utf8')
        .then(contents => console.log({ file, size, contents }))
    })

writeFile('./fileName', {a:1})
```

To access previous values in the promise chain you have to create closures over new promises chains. In more complex functions this can involve nesting promise chains inside promise chains...

---

There are two possible ways to deal with error handling in async/await, one involves wrapping chunks if your code in try/catch blocks:

``` javascript
const writeFiles = async (file, data) => {
  try {
    await writeFile(file, JSON.stringify(data), 'utf8')
  } catch (e) {
    throw new Error('error writing file:', e)
  }
  console.log('done writing')
  try {
    const stats = await statFile(file)
  } catch (e) {
    throw new Error('could not stat file:', e)
  }
  const size = stats.size
  try {
    const contents = await readFile(file, 'utf8')
  } catch (e) {
    throw new Error('error reading file:', e)
  }
  console.log({ file, size, contents })
}
```

But if you prefer you can still use `.catch()`:

``` javascript
const writeFiles = async (file, data) => {
  await writeFile(file, JSON.stringify(data), 'utf8')
    .catch(e => throw new Error('error writing file:', e))
  console.log('done writing')
  const stats = await statFile(file)
    .catch(e => throw new Error('could not stat file:', e))
  const size = stats.size
  const contents = await readFile(file, 'utf8')
    .catch(e => throw new Error('error reading file:', e))
  console.log({ file, size, contents })
}
```

### Further reading

* [Observables](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) - for async events that may generate multiple (possibly infinite) values over time
* [Futures](https://github.com/fluture-js/Fluture) - an alternative to promises

[eventloop]: https://www.youtube.com/watch?v=8aGhZQkoFbQ
[broken]: https://medium.com/@avaq/broken-promises-2ae92780f33
