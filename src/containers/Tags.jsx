// @flow
import React from 'react'
import { injectState } from 'freactal'

import PostExcerpt from '../components/Post'

const Tags = ({ state, match }) => {
  const posts = state.excerpts.filter(e => e.tags.includes(match.params.tag))
  return (
    <div style={{ padding: '10px' }}>
      {posts.map(e =>
        <PostExcerpt key={`${e.title}${e.date}`} {...e} />)}
    </div>
  )
}

export default injectState(Tags)
