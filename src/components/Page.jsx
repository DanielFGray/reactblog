// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import ago from 's-ago'

import style from './Post.sss'

const Post = ({ file, title, date, content }: {
  file: string,
  title: string,
  date: number,
  content: string,
}) => {
  const dateObj = new Date(date)
  return (
    <div className={style.postExcerpt}>
      <h1 className={style.title}>
        <Link to={`/${file}`}>
          {title}
        </Link>
      </h1>
      <div className={style.meta}>
        {date > 0 && <div className={style.date}>
          <a title={dateObj.toLocaleDateString()}>
            {ago(dateObj)}
          </a>
        </div>}
      </div>
      <div className={style.content} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export default Post
