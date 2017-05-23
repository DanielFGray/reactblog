// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'

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
        <TagList tags={this.props.state.tags} />
        <div>
          {this.props.state.posts.map(e => <PostExcerpt key={`${e.title}${e.date}`} {...e} />)}
        </div>
      </div>
    )
  }
}

const TagList = ({ tags }) => (
  <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
    {tags.map(e => <li key={e.name} style={{ padding: '0 5px', display: 'inline-block' }}>{e.name}</li>)}
  </ul>
)

const PostExcerpt = ({ title, date, tags, content }) => (
  <div style={{ padding: 0, margin: '5px' }}>
    <h3 style={{ margin: 0 }}>{title}</h3>
    <div>{date} - [{tags.join(', ')}]</div>
    <div>{content}</div>
  </div>
)

export default injectState(Home)
