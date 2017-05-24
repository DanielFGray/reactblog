// @flow
import React from 'react'
import { render } from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'
import { injectState } from 'freactal'

import './style.sss'

import Home from './containers/Home'
import Nav from './components/Nav'
import Post from './containers/Post'
import Categories from './containers/Categories'
import Tags from './containers/Tags'

import { Provider } from './actions'

const App = Provider(injectState(
  class extends React.Component {
    componentDidMount() {
      this.getPosts()
    }

    componentWillReceiveProps() {
      this.getPosts()
    }

    getPosts = () =>
      this.props.effects.getPosts()

    render() {
      return (
        <Router>
          <div>
            <Nav />
            <Route path="/" exact component={Home} />
            <Route path="/tags" exact component={Home} />
            <Route path="/tags/:tag" component={Tags} />
            <Route path="/:category" exact component={Categories} />
            <Route path="/:category/:title" component={Post} />
          </div>
        </Router>
      )
    }
  }))

document.addEventListener('DOMContentLoaded', () =>
  render(<App />, document.getElementById('root')))
