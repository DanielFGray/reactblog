// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'

const Categories = ({ state, match }) => {
  const posts = state.excerpts.filter(e => e.category === match.params.category)
  return (
    <div className={style.excerpts}>
      <Helmet>
        <title>DanielFGray - {match.params.category}</title>
      </Helmet>
      {posts.map(e =>
        <Excerpt key={`${e.title}${e.date}`} {...e} />)}
    </div>
  )
}

export default injectState(Categories)
