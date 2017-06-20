// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'

const Tags = ({ state, match }) => {
  const posts = state.excerpts.filter(e => e.tags.includes(match.params.tag))
  return (
    <div className={style.excerpts}>
      <Helmet>
        <title>DanielFGray - {match.params.tag}</title>
      </Helmet>
      {posts.map(e =>
        <Excerpt key={`${e.title}${e.date}`} {...e} />)}
    </div>
  )
}

export default injectState(Tags)
