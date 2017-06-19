// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import { has } from '../utils'
import Spinner from '../components/Spinner'
import Post from '../components/Post'

class PostView extends Component {
  props: {
    state: {
      postPending?: boolean,
      excerpts: Array<Object>,
      post: Object,
    },
    effects: {
      getPost: Function,
    },
    match: {
      params: {
        title: string,
      },
    },
  }

  static defaultProps = {
    state: {
      postPending: true,
    },
  }

  state = {
    post: this.props.state.excerpts
      .find(e => e.file === this.props.match.params.title),
  }

  componentDidMount() {
    this.getPost()
  }

  componentWillReceiveProps(nextProps) {
    if (has(nextProps.state.post, 'file') && nextProps.state.post.file === this.props.match.params.title) {
      this.setState({ post: nextProps.state.post })
    }
  }

  getPost = () => {
    this.props.effects.getPost(this.props.match.params.title)
  }

  render() {
    return (
      <div style={{ padding: '10px' }}>
        {this.state.post && <Post {...this.state.post} />}
        {this.props.state.postPending && <Spinner />}
      </div>
    )
  }
}

export default injectState(PostView)
