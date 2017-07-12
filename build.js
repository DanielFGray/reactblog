// @flow
/* eslint-disable no-console */
const commander = require('commander')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const matter = require('gray-matter')
const mkdirp = require('mkdirp')
const { Observable } = require('rxjs')
const Promise = require('bluebird')
const yaml = require('js-yaml')
const $ = require('cheerio')
const chokidar = require('chokidar')
const pretty = require('pretty-bytes')
const { ifElse, identity, toString } = require('ramda')
const markdown = require('./markdown')

commander.option('-w, --watch', 're-build on file changes')
commander.parse(process.argv)

const readFile = Promise.promisify(fs.readFile)
const stat = Promise.promisify(fs.stat)
const writeFile = Promise.promisify(fs.writeFile)
const mkdir = Promise.promisify(mkdirp)

const merge = (...a) => Object.assign({}, ...a)

const config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))
if (! config.contentDir || ! config.outputDir) {
  console.error('contentDir and outputDir must be specified in config.yaml')
  process.exit(1)
}

const contentDir = path.resolve(__dirname, config.contentDir)
const fileGlob = `${config.contentDir}/**/*.md`

const file$ =
  commander.watch
  ?
    Observable.create((obs) => {
      const watcher = chokidar.watch(fileGlob)
      watcher.on('add', file => obs.next(file))
      watcher.on('change', file => obs.next(file))
    })
  :
    Observable.from(globby(fileGlob))
      .flatMap(identity)

const convert$ = file$
  .map(file => path.resolve(file))
  .flatMap(file =>
    Observable.from(readFile(file))
      .map(toString)
      .map(matter)
      .map(({ data, content }) => merge(data, {
        file: file.replace(new RegExp(`^${contentDir}(.*).md$`), '$1'),
        content: markdown(content),
        date: (new Date(data.date)).getTime(),
      })))
  .filter(x => x.draft !== true || config.draftMode)

const meta$ = convert$
  .map(x => merge(x, {
    content: $(x.content).first('p').text(),
    file: x.file.split('/').slice(-1)[0],
  }))
  .scan((p, c) => merge(p, { [c.file.replace(/\.md$/, '')]: c }), {})
  .map(x => ({ content: x, file: 'index' }))
  .distinctUntilChanged()
  .debounceTime(500)

Observable.merge(convert$, meta$)
  .flatMap((x) => {
    const filePieces = x.file.split('/').filter(p => p.length > 0)
    const outputDir = path.resolve(__dirname, config.outputDir)
    const filePath = path.join(outputDir, ...filePieces)
    const [_, outBase, basename] = Array.from(filePath.match(/^(.+)\/([^/]+)$/))
    const fileName = path.join(outBase, basename).concat('.json')
    const output = JSON.stringify(merge(x, { file: basename }))
    return Observable.from(mkdir(outBase))
      .flatMap(() => writeFile(`${fileName}`, output))
      .flatMap(() => stat(fileName))
      .map(({ size }) => `${fileName.replace(__dirname, '.')} written [${pretty(size)}]`)
  })
  .subscribe(console.log, console.error)
