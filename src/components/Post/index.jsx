// @flow
import React from 'react'
import { Helmet } from 'react-helmet'

import Excerpt from '../Excerpt'
import style from './style.sss'

const PostView = (props: Object) => (
  <article className={style.post}>
    <Helmet>
      <title>DanielFGray - {props.title}</title>
    </Helmet>
    <Excerpt {...props} />
  </article>
)

export default PostView
