// @flow
import React from 'react'
import { injectState } from 'freactal'

import style from './Home.sss'
import PostExcerpt from '../components/Post'

const Categories = ({ state, match }) => {
  const posts = state.excerpts.filter(e => e.category === match.params.category)
  return (
    <div className={style.excerpts}>
      {posts.map(e =>
        <PostExcerpt key={`${e.title}${e.date}`} {...e} />)}
    </div>
  )
}

export default injectState(Categories)
