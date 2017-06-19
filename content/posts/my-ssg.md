---
layout: post
title: "How I Made My Own Static-Site Generator"
category: computers
tags: [programming, javascript, frp, rxjs]
date: 2017/06/18
---

I had a fun time making my own static-site generator for this blog, and I thought this could serve as a practical introduction to Functional Reactive Programming (FRP).

# Getting started

The idea I had when I set out to re-create this blog (which previously used [Hexo][hexo]), was that I wanted to make a React front-end for my markdown content which would requested asynchronously as necessary. I tried a few different static site generators, and could not seem to get any of them to output JSON, so I thought "well how hard could it be?"

So, I have a folder full of markdown files, and I'd ideally like to get this in the form of an array.
I played around with a few different methods for this, and in the end settled on [globby][globby].

``` javascript
const globby = require('globby')
globby(`${__dirname}/content/**/*.md`, { absolute: true })
  .then(console.log)
```

This searches recursively from the content dir and finds all files ending in `.md`. Perfect.

But this only prints a list of files, it doesn't return their contents.

At this point, I realized [RxJS][rxjs] would be a great fit for all of this, as it would easily let me operate concurrently on each file as an item in a stream.

``` javascript
const globby = require('globby')
const Rx = require('rxjs')

const contentDir = `${__dirname}/content`

const glob = globby(`${contentDir}/**/*.md`, { absolute: true })

Rx.Observable.from(glob)
  .subscribe(console.log)
```

This has the same effect as the Promise version, but, if we add an additional method, we can "flatten" the stream so that instead of a single array in the stream, each array item would be an item in the stream:

``` javascript
const globby = require('globby')
const Rx = require('rxjs')

const contentDir = `${__dirname}/content`

const glob = globby(`${contentDir}/**/*.md`, { absolute: true })

Rx.Observable.from(glob)
  .flatMap(x => x)
  .subscribe(console.log)
```

Although, still not a huge improvement over simply using a Promise.

# Reading files

Let's try and actually read each file. I find the default callback nature of the `fs` module in node.js slightly awkward to use, and prefer using [Bluebird][bluebird] to create a Promise-based interface, which also works really well with RxJS.

``` javascript
const fs = require('fs')
const globby = require('globby')
const Rx = require('rxjs')
const Promise = require('bluebird')

const contentDir = `${__dirname}/content`

const readFile = Promise.promisify(fs.readFile)
const glob = globby(`${contentDir}/**/*.md`, { absolute: true })

Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(x => readFile(x))
  .subscribe(console.log)
``` 

`flatMap` will resolve the `readFile` promise and return the result. Unfortunately the default behavior is to return a `Buffer` rather than an a string. Fortunately this is easily fixed:

``` javascript
// ...
Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(x => readFile(x))
  .map(x => x.toString())
  .subscribe(console.log)
```

There's a fair amount going on here in a few lines so let's re-cap:

* An Observable is created based on the Promise returned from `globby`
* `globby` returns an array of paths, and the array is flattened so that each item in the array becomes an item in the Observable's stream
* Each path in the stream is passed to `readFile` which returns a `Buffer`
* Each `Buffer` is converted to a string
* Each file is printed with `console.log`

I should probably point out that an Observable can be initialized, but doesn't perform any actions until it is `subscribe`d to. Much like Promises can be initialized, but do not resolve until `.then()` is called on it.

# Parsing front matter

My markdown files contain front matter, and so I started looking for a library to parse that. I eventually found [gray-matter][graymatter], which takes a string containing front matter and returns an object.

Throwing this into our stream looks like

``` javascript
const fs = require('fs')
const globby = require('globby')
const Rx = require('rxjs')
const Promise = require('bluebird')
const matter = require('gray-matter')

const contentDir = `${__dirname}/content`

const readFile = Promise.promisify(fs.readFile)
const glob = globby(`${contentDir}/**/*.md`, { absolute: true })

Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(x => readFile(x))
  .map(x => x.toString())
  .map(x => matter(x))
  .subscribe(console.log)
```

But I wasn't entirely happy with the output here as it splits the front matter and content into separate objects and also retains the original content which I didn't care about that.

Initially I wanted to use object spread, but that isn't currently available in Node, so I created a small little helper function that creates a new object from the objects given to it:

``` javascript
const merge = (...objects) => Object.assign({}, ...objects)
```

Which lets me create a new object containing just the data and content keys:

``` javascript
const merge = (...objects) => Object.assign({}, ...objects)
Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(x => readFile(x))
  .map(x => x.toString())
  .map(x => matter(x))
  .map({ data, content } => merge(data, { content }))
  .subscribe(console.log)
```

I also wanted to convert the date key in my front matter into a UNIX timestamp, and add the filename into the object so that it would be easy to determine the name of the file to write to later. At this point I realized that the filename data was lost at this point in the stream, and I had to re-think the pattern I was using. I eventually solved both of these problems with the following:

``` javascript
const merge = (...objects) => Object.assign({}, ...objects)
Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(file => Observable.from(readFile(file))
    .map(x => x.toString())
    .map(x => matter(x))
    .map({ data, content } => merge(data, {
      file: file.replace(new RegExp(`^${contentDir}(.*).md$`), '$1'),
      content,
      date: (new Date(data.date)).getTime(),
    })))
  .subscribe(console.log)
```

It's mostly the same, only an Observable is created inside the stream, which `flatMap` resolves and returns the value from it. This also allows `file` to be in scope the whole time.

# Generating HTML

At this point it becomes pretty trivial to parse the markdown into actual html. [marked][marked] has been my favorite choice for this, and adding it into the mix looks like this: 

``` javascript
const fs = require('fs')
const globby = require('globby')
const Rx = require('rxjs')
const Promise = require('bluebird')
const matter = require('gray-matter')
const marked = require('marked')

const contentDir = `${__dirname}/content`

const merge = (...objects) => Object.assign({}, ...objects)

const readFile = Promise.promisify(fs.readFile)
const glob = globby(`${contentDir}/**/*.md`, { absolute: true })

Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(file => Observable.from(readFile(file))
    .map(x => x.toString())
    .map(x => matter(x))
    .map({ data, content } => merge(data, {
      file: file.replace(new RegExp(`^${contentDir}(.*).md$`), '$1'),
      content: marked(content),
      date: (new Date(data.date)).getTime(),
    })))
  .subscribe(console.log)
```

This has 90% of the functionality I wanted, all that is lft is writing each item in the stream to disk. This is where things got ugly.

# Writing to disk

I'm going to skim over the details, but this takes an object containing a `file` key, and writes to a directory called `public` and maintains the same path that the file came from. So if a file was in `content/posts/foo.md` it will be written to `public/posts/foo.json`.

``` javascript
const writeFile = (object) => {
  const filePieces = object.file
    .split('/')
    .filter(p => p.length > 0)
  const outputDir = path.resolve(__dirname, 'public')
  const filePath = path.join(outputDir, ...filePieces)
  const [_, outBase, basename] = Array.from(filePath.match(/^(.+)\/([^/]+)$/))
  return Promise.promisify(mkdirp)(outBase)
    .then(() => {
      const fileName = path.join(outBase, basename)
      const write$ = fs.createWriteStream(`${fileName}.json`)
      const output = JSON.stringify(merge(object, { file: basename }))
      return write$.write(output)
    })
    .catch(console.log)
}
```

I'm also using a Promisified [mkdirp][mkdirp] to create directories as they're needed. The whole thing so far looks like:

``` javascript
const fs = require('fs')
const globby = require('globby')
const Rx = require('rxjs')
const Promise = require('bluebird')
const matter = require('gray-matter')
const marked = require('marked')
const mkdirp = require('mkdirp')

const contentDir = `${__dirname}/content`

const merge = (...objects) => Object.assign({}, ...objects)

const readFile = Promise.promisify(fs.readFile)
const glob = globby(`${contentDir}/**/*.md`, { absolute: true })

const writeFile = (object) => {
  const filePieces = object.file
    .split('/')
    .filter(p => p.length > 0)
  const outputDir = path.resolve(__dirname, 'public')
  const filePath = path.join(outputDir, ...filePieces)
  const [_, outBase, basename] = Array.from(filePath.match(/^(.+)\/([^/]+)$/))
  return Promise.promisify(mkdirp)(outBase)
    .then(() => {
      const fileName = path.join(outBase, basename)
      const write$ = fs.createWriteStream(`${fileName}.json`)
      const output = JSON.stringify(merge(object, { file: basename }))
      return write$.write(output)
    })
    .catch(console.log)
}

Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(file => Observable.from(readFile(file))
    .map(x => x.toString())
    .map(x => matter(x))
    .map({ data, content } => merge(data, {
      file: file.replace(new RegExp(`^${contentDir}(.*).md$`), '$1'),
      content: marked(content),
      date: (new Date(data.date)).getTime(),
    })))
  .subscribe(writeFile)
```

This *works*, but I still wasn't happy. There were two key features I still wanted: an `index.json` that contained all the metadata of each post and a small excerpt, and syntax highlighting.

# Excerpts

Creating a 'meta-file' turned out to be pretty easy. I found [cheerio][cheerio] which lets me operate on strings of html with an api similar to jQuery, which made it really easy to grab the first paragraph of each post. After that I needed to create a new stream from the existing stream (a meta-stream for my meta-data), and then create one big array containing all the files in the stream:

``` javascript
const $ = require('cheerio')

// ...

const file$ = Rx.Observable.from(glob)
  .flatMap(x => x)
  .flatMap(file => Observable.from(readFile(file))
    .map(x => x.toString())
    .map(x => matter(x))
    .map({ data, content } => merge(data, {
      file: file.replace(new RegExp(`^${contentDir}(.*).md$`), '$1'),
      content: marked(content),
      date: (new Date(data.date)).getTime(),
    })))

const index$ = file$
  .map(x => merge(x, {
    content: $(x.content).first('p').text(),
    file: x.file.split('/').slice(-1)[0],
  }))
  .reduce((p, c) => p.concat(c), [])
  .map(x => ({ content: x, file: 'index' }))

Rx.Observable.merge(file$, index$)
  .subscribe(writeFile)
```

# Syntax highlighting

Syntax highlighting turned out to be a bigger pain than I thought. I tried a few different libraries and eventually settled on [prism.js][prism]. It turned out that I had to `require()` all the different languages I used, and I'd prefer not to update my build script for each language I may blog about, so I had to figure out how to dynamically require each language. In the end this is what I came up with:

``` javascript
const prism = require('prismjs')
// ...

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const renderer = new marked.Renderer()
renderer.code = function renderCode(code, lang) {
  const c = this.options.highlight(code, lang)
  if (! lang) return `<pre><code>${c}</code></pre>`
  if (! prism.languages[lang]) {
    const component = `prismjs/components/prism-${lang}.min.js`
    if (fs.statSync(path.join(__dirname, 'node_modules', component))) {
      require(component)
    } else return `<pre><code>${c}</code></pre>`
  }
  const langClass = `${this.options.langPrefix}${lang}`
  return `<pre class="${langClass}"><code>${c}</code></pre>`
}

marked.setOptions({
  sanitize: false,
  breaks: true,
  tables: true,
  gfm: true,
  langPrefix: 'language-',
  renderer,
  highlight: (code, language) => {
    if (! has(prism.languages, language)) {
      language = prism.languages[language] || 'markup'
    }
    return prism.highlight(code, prism.languages[language])
  },
})
```

The whole script can be found here on GitLab: https://gitlab.com/danielfgray/reactblog/blob/master/build.js

[hexo]: https://hexo.io
[globby]: https://github.com/sindresorhus/globby
[rxjs]: http://reactivex.io/rxjs/
[bluebird]: http://bluebirdjs.com/docs/getting-started.html
[graymatter]: https://github.com/jonschlinkert/gray-matter
[marked]: https://github.com/chjj/marked
[mkdirp]: https://github.com/substack/node-mkdirp
[cheerio]: https://cheerio.js.org/
[prism]: http://prismjs.com/
