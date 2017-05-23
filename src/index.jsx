// @flow
import React from 'react'
import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import './style.sss'

import Home from './containers/Home'
import Nav from './components/Nav'

import { Provider } from './actions'

const App = Provider(() => (
  <Router>
    <div>
      <Nav />
      <Route exact path="/" component={Home} />
      <Route exact path="/tags" component={Home} />
      <Route exact path="/tags/:tag" component={Home} />
      <Route exact path="/:category" component={Home} />
      <Route exact path="/:category/:title" component={Home} />
    </div>
  </Router>
))

document.addEventListener('DOMContentLoaded', () =>
  render(<App />, document.getElementById('root')))
