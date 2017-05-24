// @flow
import React from 'react'
import { injectState } from 'freactal'

import style from './Home.sss'
import PostExcerpt from '../components/Post'

const Home = ({ state }) => {
  if (state.postsPending) {
    return null
  }

  return (
    <div className={style.excerpts}>
      {state.excerpts.map(e =>
        <PostExcerpt key={`${e.title}${e.date}`} {...e} />)}
    </div>
  )
}

export default injectState(Home)
