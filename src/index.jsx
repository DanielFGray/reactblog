// @flow
import React from 'react'
import { render } from 'react-dom'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { injectState } from 'freactal'

import 'normalize.css'
import 'prismjs/themes/prism-okaidia.css'
import style from './style.sss'

import Provider from './actions'
import Home from './containers/Home'
import Nav from './components/Nav'
import Post from './containers/Post'
import Page from './containers/Page'
import Categories from './containers/Categories'
import Tags from './containers/Tags'

const App = props => (
  <Router>
    <div>
      <Nav />
      <article className={style.content}>
        <Switch>
          <Route path="/" exact component={Home} />
          {props.state.pages.map(e => <Route key={e.toLowerCase()} path={`/${e.toLowerCase()}`} exact component={Page} />)}
          <Route path="/tags" exact component={Home} />
          <Route path="/tags/:tag" component={Tags} />
          <Route path="/:category" exact component={Categories} />
          <Route path="/:category/:title" component={Post} />
        </Switch>
      </article>
    </div>
  </Router>
)

const Init = Provider(injectState(App))
document.addEventListener('DOMContentLoaded', () =>
  render(<Init />, document.getElementById('root')))

