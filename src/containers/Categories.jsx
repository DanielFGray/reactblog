// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'
import {
  allPass,
  filter,
  pipe,
  prop,
  propEq,
  reverse,
  sortBy,
  values,
} from 'ramda'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'

const postsByCategory = (category: String, excerpts: Object) =>
  pipe(
    values,
    filter(allPass([
      propEq('layout', 'post'),
      propEq('category', category),
    ])),
    sortBy(prop('date')),
    reverse,
  )(excerpts)

const Categories = ({ state: { excerpts }, match: { params: { category } } }) => (
  <div className={style.excerpts}>
    <Helmet>
      <title>DanielFGray - {category}</title>
    </Helmet>
    {postsByCategory(category, excerpts).map(e =>
      <Excerpt key={`${e.title}${e.date}`} {...e} />)}
  </div>
)

export default injectState(Categories)
