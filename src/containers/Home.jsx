// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'

import style from './Home.sss'
import PostExcerpt from '../components/Post'

const Loader = () => (
  <div children="Loading" />
)

class Home extends Component {
  componentDidMount() {
    if (this.props.state.excerpts.length < 1) {
      this.props.effects.getPosts()
    }
  }

  render() {
    if (this.props.state.postsPending) {
      return <Loader />
    }

    return (
      <div className={style.excerpts}>
        {this.props.state.excerpts.map(e =>
          <PostExcerpt key={`${e.title}${e.date}`} {...e} />)}
      </div>
    )
  }
}

export default injectState(Home)
