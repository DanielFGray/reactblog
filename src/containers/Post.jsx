// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import {
  find,
} from 'lodash/fp'
import { get } from 'axios'

import Post from '../components/Post'

class PostView extends Component {
  state = {
    post: find(e => e.file === this.props.match.params.title, this.props.state.excerpts),
  }

  componentDidMount() {
    this.getPost()
  }

  componentWillReceiveProps() {
    this.getPost()
  }

  getPost = () => {
    const { match } = this.props
    const file = match.params.title
    get(`/api/posts/${file}.json`)
      .then(res => res.data)
      .then(post => this.setState({ post }))
  }

  render() {
    return (
      <div style={{ padding: '10px' }}>
        <Post {...this.state.post} />
      </div>
    )
  }
}

export default injectState(PostView)
