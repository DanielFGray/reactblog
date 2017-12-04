// @flow
const fs = require('fs')
const path = require('path')
const prism = require('prismjs')
const { has } = require('./src/utils')
const marked = require('marked')

const renderer = new marked.Renderer()
renderer.code = function renderCode(code, lang) {
  const c = this.options.highlight(code, lang)
  if (! lang) return `<pre class="language-">${c}</pre>`
  if (! prism.languages[lang]) {
    const component = `prismjs/components/prism-${lang.toLowerCase()}.min.js`
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

module.exports = str => marked(str)
