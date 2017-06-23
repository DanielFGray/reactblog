// @flow
/* eslint-disable no-console */
const commander = require('commander')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const marked = require('marked')
const matter = require('gray-matter')
const mkdirp = require('mkdirp')
const { Observable } = require('rxjs');
const Promise = require('bluebird')
const yaml = require('js-yaml')
const $ = require('cheerio')
const prism = require('prismjs')
const chokidar = require('chokidar')
const { has } = require('./src/utils')

commander.option('-w, --watch', 're-build on file changes')
commander.parse(process.argv)

const readFile = Promise.promisify(fs.readFile)
const mkdir = Promise.promisify(mkdirp)

const merge = (...a) => Object.assign({}, ...a)

const renderer = new marked.Renderer()
renderer.code = function renderCode(code, lang) {
  const c = this.options.highlight(code, lang)
  if (! lang) return `<pre class="language-">${c}</pre>`
  if (! prism.languages[lang]) {
    const component = `prismjs/components/prism-${lang}.min.js`
    if (fs.statSync(path.join(__dirname, 'node_modules', component))) {
      // flow-disable-next-line
      require(component) // eslint-disable-line global-require,import/no-dynamic-require
    } else {
      return `<pre class="language-">${c}</pre>`
    }
  }
  const langClass = `${this.options.langPrefix}${lang}`
  return `<pre class="${langClass}">${c}</pre>`
}
renderer.heading = function headings(text, level) {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')
  return `<h${level}><a name="${escapedText}" class="anchor" href="#${escapedText}"><span class="header-link">${'#'.repeat(level)}</span></a> ${text}</h${level}>`
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
      language = prism.languages[language] || 'markup' // eslint-disable-line no-param-reassign
    }
    return prism.highlight(code, prism.languages[language])
  },
})

const getConfig = async () => {
  const config = yaml.safeLoad(await readFile('config.yaml', 'utf8'))
  if (! config.contentDir || ! config.outputDir) {
    console.error('contentDir and outputDir must be specified in config.yaml')
    process.exit(1)
  }
  return config
}


const main = ({ source, config }) => {
  const base = path.resolve(__dirname, config.contentDir)
  const file$ = source
    .flatMap(fileName =>
      Observable.from(readFile(fileName))
      .map(x => matter(x.toString()))
      .map(({ data, content }) => merge(data, {
        file: fileName.replace(new RegExp(`^${base}(.*).md$`), '$1'),
        content: marked(content),
        date: (new Date(data.date)).getTime(),
      })))
    .filter(x => x.draft !== true || config.draftMode)

  const meta$ = file$
    .map(x => merge(x, {
      content: $(x.content).first('p').text(),
      file: x.file.split('/').slice(-1)[0],
    }))
    .scan((p, c) => merge(p, { [c.file.replace(/\.md$/, '')]: c }), {})
    .map(x => ({ pages: x, file: 'index' }))
    .debounceTime(500)

  const writeFile = (o) => {
    const filePieces = o.file.split('/').filter(p => p.length > 0)
    const outputDir = path.resolve(__dirname, config.outputDir)
    const filePath = path.join(outputDir, ...filePieces)
    const [_, outBase, basename] = Array.from(filePath.match(/^(.+)\/([^/]+)$/))
    const fileName = path.join(outBase, basename).concat('.json')
    const output = JSON.stringify(merge(o, { file: basename }))
    return mkdir(outBase)
      .then(() => {
        const write$ = fs.createWriteStream(`${fileName}`)
        write$.write(output)
        write$.close()
        return Promise.promisify(fs.stat)(fileName)
      })
      .then(x => console.log(`${fileName.replace(__dirname, '')} written [${x.size / 1024}Kb]`))
      .catch(console.log)
  }

  return Observable.merge(file$, meta$)
    .subscribe(writeFile, console.error)
}

(async () => {
  const config = await getConfig()
  const fileGlob = `${config.contentDir}/**/*.md`
  const source = commander.watch
    ? Observable.create((obs) => {
      const watcher = chokidar.watch(fileGlob)
      watcher.on('add', p => obs.next(p))
      watcher.on('change', p => obs.next(p))
    })
      .map(p => path.resolve(p))
    : Observable.from(globby(fileGlob, { absolute: true }))
        .flatMap(x => x)
  main({ config, source })
})()
