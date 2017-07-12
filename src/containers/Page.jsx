// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'
import { has } from '../utils'
import Spinner from '../components/Spinner'
import Page from '../components/Page'

class PostView extends Component {
  props: {
    state: {
      postPending?: boolean,
      excerpts: Array<Object>,
      page: Object,
    },
    effects: {
      getPage: Function,
    },
    match: {
      url: string,
    },
  }

  static defaultProps = {
    state: {
      postPending: true,
    },
  }

  state = {
    page: this.props.state.excerpts
      .find(e => e.file === this.props.match.url.slice(1)),
  }

  componentDidMount() {
    this.getPage()
  }

  componentWillReceiveProps(nextProps) {
    if (has(nextProps.state.page, 'file') && nextProps.state.page.file === this.props.match.url.slice(1)) {
      this.setState({ page: nextProps.state.page })
    }
  }

  getPage = () => {
    this.props.effects.getPage(this.props.match.url.slice(1))
      .then(this.hashLinkScroll)
  }

  hashLinkScroll = () => {
    const { hash } = window.location
    if (hash !== '') {
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) element.scrollIntoView()
      }, 0)
    }
  }

  render() {
    return (
      <div style={{ padding: '10px' }}>
        <Helmet>
          <title>DanielFGray - {this.state.page.title}</title>
        </Helmet>
        {this.state.page && <Page {...this.state.page} />}
        {this.props.state.postPending && <Spinner />}
      </div>
    )
  }
}

export default injectState(PostView)
