// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import ago from 's-ago'

import style from './Post/style.sss'

const Post = ({ title, content }: {
  title: string,
  content: string,
}) => (
  <div className={style.postExcerpt}>
    <h1 className={style.title}>
      {title}
    </h1>
    <div className={style.content} dangerouslySetInnerHTML={{ __html: content }} />
  </div>
)


export default Post
