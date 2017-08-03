// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'
import Spinner from '../components/Spinner'
import Page from '../components/Page'

class PostView extends Component {
  props: {
    state: {
      pagePending: boolean,
      page: Object,
      excerpts: Object,
    },
    effects: {
      getPage: Function,
    },
    location: {
      pathname: string,
    },
  }

  static defaultProps = {
    state: {
      postPending: true,
    },
  }

  state = {
    page: this.props.state.excerpts[this.props.location.pathname.slice(1)],
  }

  componentDidMount() {
    this.getPage()
  }

  getPage = () => {
    this.props.effects
      .getPage(this.props.location.pathname.slice(1))
      .then(this.hashLinkScroll)
  }

  hashLinkScroll = () => {
    const { hash } = window.location
    if (hash !== '') {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''))
        if (element) {
          element.scrollIntoView()
        }
      }, 0)
    }
  }

  render() {
    return (
      <div style={{ padding: '10px' }}>
        <Helmet>
          <title>DanielFGray - {this.state.page.title}</title>
        </Helmet>
        <Page {...this.props.state.page} />
        {this.props.state.pagePending && <Spinner />}
      </div>
    )
  }
}

export default injectState(PostView)
