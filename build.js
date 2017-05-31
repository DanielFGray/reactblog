// @flow
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const marked = require('marked')
const matter = require('gray-matter')
const mkdirp = require('mkdirp')
const { Observable } = require('rxjs')
const Promise = require('bluebird')
const yaml = require('js-yaml')
const $ = require('cheerio')
const highlight = require('highlight.js')

const readFile = Promise.promisify(fs.readFile)
const mkdir = Promise.promisify(mkdirp)

const config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))

highlight.configure({
  tabreplace: '  ',
})
const renderer = new marked.Renderer()
renderer.code = function renderCode(code, lang) {
  const c = this.options.highlight(code, lang)
  if (! lang) return `<pre><code>${c}</code></pre>`
  const langClass = `hljs ${this.options.langPrefix}${lang}`
  return `<pre><code class="${langClass}">${c}</code></pre>`
}

marked.setOptions({
  sanitize: false,
  breaks: true,
  tables: true,
  gfm: true,
  renderer,
  highlight: (code, language) =>
    (language ? highlight.highlight(language, code).value : code),
})

const base = path.resolve(__dirname, config.contentDir)
const merge = (...a) => Object.assign({}, ...a)

const markdown2json = fileName =>
  Observable.from(readFile(fileName))
    .map(x => x.toString())
    .map(x => matter(x))
    .map(({ data, content }) => merge(data, {
      file: fileName.replace(new RegExp(`^${base}(.*).md$`), '$1'),
      content: marked(content),
      date: (new Date(data.date)).getTime(),
    }))

const writeFile = (o) => {
  const filePieces = o.file
    .split('/')
    .filter(p => p.length > 0)
  const outputDir = path.resolve(__dirname, config.outputDir)
  const filePath = path.join(outputDir, ...filePieces)
  // flow-disable-next-line
  const [_, outBase, basename] = Array.from(filePath.match(/^(.+)\/([^/]+)$/))
  return mkdir(outBase)
    .then(() => {
      const fileName = path.join(outBase, basename)
      const write$ = fs.createWriteStream(`${fileName}.json`)
      const output = JSON.stringify(merge(o, { file: basename }))
      return write$.write(output)
    })
    .catch(console.log)
}

const excerpt = o =>
  merge(o, {
    content: $(o.content).first('p').text(),
    file: o.file.split('/').slice(-1)[0],
  })

const fileGlob = globby(`${config.contentDir}/**/*.md`, { absolute: true })
const file$ = Observable.from(fileGlob)
  .flatMap(x => x)
  .flatMap(x => markdown2json(x))

const index = file$
  .filter(x => x.layout === 'post')
  .map(x => excerpt(x))
  .reduce((p, c) => p.concat(c), [])
  .map(x => ({ content: { posts: x }, file: 'posts/index' }))

Observable.merge(file$, index)
  .subscribe(writeFile, console.error)
