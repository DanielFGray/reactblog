// @flow
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const marked = require('marked')
const matter = require('gray-matter')
const { mkdirp } = require('mkdirp')
const { Observable } = require('rxjs')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const readFile = Promise.promisify(fs.readFile)
const mkdir = Promise.promisify(mkdirp)

const config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))

marked.setOptions({
  sanitize: false,
  breaks: true,
  tables: true,
  gfm: true,
})

const base = path.resolve(__dirname, config.contentDir)

const markdown2json = fileName =>
  Observable.from(readFile(fileName))
    .map(x => x.toString())
    .map(x => matter(x))
    .map(({ data, content }) => ({
      file: fileName.replace(new RegExp(`^${base}(.*).md$`), '$1'),
      data,
      content: marked(content),
    }))

function writeFile({ file, data, content }) {
  const filePieces = file
    .split('/')
    .filter(p => p.length > 0)
  const outputDir = path.resolve(__dirname, config.outputDir)
  const filePath = path.join(outputDir, ...filePieces)
  const [_, outBase, basename] = Array.from(filePath.match(/^(.+)\/([^/]+)$/))
  return mkdir(outBase)
    .then(() => {
      const fileName = path.join(outBase, basename)
      const write$ = fs.createWriteStream(`${fileName}.json`)
      const output = JSON.stringify(Object.assign({}, data, content))
      return write$.write(output)
    })
    .catch(console.log)
}

Observable.from(globby(`${config.contentDir}/**/*.md`, { absolute: true }))
  .flatMap(x => x)
  .flatMap(markdown2json)
  .subscribe(writeFile, console.error)
