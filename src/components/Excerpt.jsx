// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import ago from 's-ago'

import style from './Post.sss'

const PostTags = ({ tags }: {
  tags: Array<string>,
}) => (
  <ul className={style.postTagList}>
    {tags.map(e => (
      <li key={e}>
        <Link to={`/tags/${e}`}>{e}</Link>
      </li>))}
  </ul>
)

const Post = ({ category, file, title, date, tags, content }: {
  file: string,
  category: string,
  title: string,
  date: number,
  tags: Array<string>,
  content: string,
}) => {
  const dateObj = new Date(date)
  return (
    <div className={style.postExcerpt}>
      <h1 className={style.title}>
        <Link to={`/${category}/${file}`}>
          {title}
        </Link>
      </h1>
      <div className={style.meta}>
        <div className={style.category}>
          <Link to={`/${category}`}>
            {category}
          </Link>
        </div>
        {date > 0 && <div className={style.date}>
          <a title={dateObj.toLocaleDateString()}>
            {ago(dateObj)}
          </a>
        </div>}
        {tags && <PostTags tags={tags} />}
      </div>
      <div className={style.content} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export default Post
