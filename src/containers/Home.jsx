// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'

const Home = ({ state: { excerpts } }) => (
  <div className={style.excerpts}>
    <Helmet>
      <title>DanielFGray</title>
    </Helmet>
    {excerpts.filter(e => e.layout === 'post').map(e =>
      <Excerpt key={`${e.title}${e.date}`} {...e} />)}
  </div>
)

export default injectState(Home)
