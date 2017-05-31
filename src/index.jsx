// @flow
import React, { Component } from 'react'
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
import Categories from './containers/Categories'
import Tags from './containers/Tags'

class App extends Component {
  componentDidMount() {
    this.getPosts()
  }

  getPosts = () => {
    this.props.effects.getPosts()
  }

  render() {
    return (
      <Router>
        <div>
          <Nav />
          <article className={style.content}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/tags" exact component={Home} />
              <Route path="/tags/:tag" component={Tags} />
              <Route path="/:category" exact component={Categories} />
              <Route path="/:category/:title" component={Post} />
            </Switch>
          </article>
        </div>
      </Router>
    )
  }
}

const Init = Provider(injectState(App))
document.addEventListener('DOMContentLoaded', () =>
  render(<Init />, document.getElementById('root')))

