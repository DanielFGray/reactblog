// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'
import {
  filter,
  sortBy,
  prop,
  propEq,
  pipe,
  values,
  reverse,
} from 'ramda'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'

const sortExcerpts = pipe(
  values,
  filter(propEq('layout', 'post')),
  sortBy(prop('date')),
  reverse,
)

const Home = ({ state: { excerpts } }) => (
  <div className={style.excerpts}>
    <Helmet>
      <title>DanielFGray</title>
    </Helmet>
    {sortExcerpts(excerpts)
      .map(e => <Excerpt key={`${e.title}${e.date}`} {...e} />)}
  </div>
)

export default injectState(Home)
