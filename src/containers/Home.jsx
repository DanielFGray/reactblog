// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import { Link } from 'react-router-dom'

import style from './Home.sss'

class Home extends Component {
  componentDidMount() {
    this.props.effects.getPosts()
  }

  render() {
    if (this.props.state.postsPending) {
      return <div>Fetching...</div>
    }
    return (
      <div>
        <div>
          {this.props.state.posts.map(e => <PostExcerpt key={`${e.title}${e.date}`} {...e} />)}
        </div>
      </div>
    )
  }
}

const PostTags = ({ tags }) => (
  <span className={style.postTagList}>
    {tags.map(e => <Link key={e} to={`/tags/${e}`}>{e}</Link>)}
  </span>
)

const PostExcerpt = ({ title, date, tags, content }) => (
  <div style={{ padding: 0, margin: '5px' }}>
    <h3 style={{ margin: 0 }}>{title}</h3>
    <div>{date} - <PostTags tags={tags} /></div>
    <div>{content}</div>
  </div>
)

export default injectState(Home)
