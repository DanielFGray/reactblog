// @flow
/* eslint-disable no-console */
const commander = require('commander')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const matter = require('gray-matter')
const mkdirp = require('mkdirp')
const { Observable } = require('rxjs')
const yaml = require('js-yaml')
const cheerio = require('cheerio')
const chokidar = require('chokidar')
const pretty = require('pretty-bytes')
const { isEmpty, last, match, equals, toString } = require('ramda')
const markdown = require('./markdown')

commander.option('-w, --watch', 're-build on file changes')
commander.parse(process.argv)

const crash = e => {
  if (e) console.error(e)
  process.exit(1)
}

const id = x => x
const merge = (...o) => o.reduce((p, c) => Object.assign(p, c), {})

const readFile = Observable.bindNodeCallback(fs.readFile)
const stat = Observable.bindNodeCallback(fs.stat)
const writeFile = Observable.bindNodeCallback(fs.writeFile)
const mkdir = Observable.bindNodeCallback(mkdirp)

const config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))

if (! config.contentDir || ! config.outputDir) {
  crash('contentDir and outputDir must be specified in config.yaml')
}

const contentDir = path.resolve(__dirname, config.contentDir)
const fileGlob = `${config.contentDir}/**/*.md`

const file$ = commander.watch
  ? Observable.create((obs) => {
    const watcher = chokidar.watch(fileGlob)
    watcher.on('add', file => obs.next(file))
    watcher.on('change', file => obs.next(file))
  })
  : Observable.from(globby(fileGlob))
    .flatMap(id)

const convert$ = file$
  .map(f => path.resolve(f))
  .flatMap(fileName => readFile(fileName)
    .map(toString)
    .map(matter)
    .map(({ data, content }) => ({
      ...data,
      file: fileName.replace(new RegExp(`^${contentDir}(.*).md$`), '$1'),
      content: markdown(content),
      date: (new Date(data.date)).getTime(),
    })))
  .filter(x => x.draft !== true || config.draftMode)

const meta$ = convert$
  .map(x => merge(x, {
    content: cheerio(x.content).first('p').text(),
    file: x.file.split('/').slice(-1)[0],
  }))
  .scan((p, c) => ({ ...p,  [c.file.replace(/\.md$/, '')]: c }), {})
  .map(content => ({ content, file: 'index' }))
  .bufferTime(100)
  .filter(x => ! isEmpty(x))
  .map(last)

Observable.merge(convert$, meta$)
  .flatMap((x) => {
    const filePieces = x.file.split('/').filter(id)
    const outputDir = path.resolve(__dirname, config.jsonOutput)
    const filePath = path.join(outputDir, ...filePieces)
    const [outBase, basename] = match(/^(.+)\/([^/]+)$/, filePath).slice(1)
    const fileName = path.join(outBase, basename).concat('.json')
    const output = JSON.stringify(merge(x, { file: basename }))
    return mkdir(outBase)
      .concatMap(() => writeFile(`${fileName}`, output))
      .concatMap(() => stat(fileName))
      .map(({ size }) => `${fileName.replace(__dirname, '.')} written [${pretty(size)}]`)
  })
  .subscribe(console.log, console.error)
