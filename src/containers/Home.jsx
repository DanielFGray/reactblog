// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'
import Spinner from '../components/Spinner'

const Home = ({ state: { excerpts, excerptsPending } }) => (
  <div className={style.excerpts}>
    <Helmet>
      <title>DanielFGray</title>
    </Helmet>
    {excerptsPending && <Spinner />}
    {excerpts.map(e =>
      <Excerpt key={`${e.title}${e.date}`} {...e} />)}
  </div>
)

export default injectState(Home)
