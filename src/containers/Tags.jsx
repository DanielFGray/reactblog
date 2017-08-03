// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Helmet } from 'react-helmet'
import {
  allPass,
  filter,
  contains,
  pipe,
  prop,
  propEq,
  reverse,
  sortBy,
  values,
} from 'ramda'

import style from './Home.sss'
import Excerpt from '../components/Excerpt'

const postsByTag = (tag: String, excerpts: Object) =>
  pipe(
    values,
    filter(allPass([
      propEq('layout', 'post'),
      pipe(prop('tags'), contains(tag)),
    ])),
    sortBy(prop('date')),
    reverse,
  )(excerpts)

const Tags = ({ state: { excerpts }, match: { params: { tag } } }) => (
  <div className={style.excerpts}>
    <Helmet>
      <title>DanielFGray - {tag}</title>
    </Helmet>
    {postsByTag(tag, excerpts).map(e =>
      <Excerpt key={`${e.title}${e.date}`} {...e} />)}
  </div>
)

export default injectState(Tags)
