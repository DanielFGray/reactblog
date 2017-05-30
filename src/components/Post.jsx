// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import ago from 's-ago'

import style from './Post.sss'

const PostTags = ({ tags }: {
  tags: Array<string>,
}) => (
  <ul className={style.postTagList}>
    {tags.map(e => <li key={e}><Link to={`/tags/${e}`}>{e}</Link></li>)}
  </ul>
)

const PostView = ({ category, file, title, date, tags, content }: {
  file: string,
  category: string,
  title: string,
  date: number,
  tags: Array<string>,
  content: string
}) => (
  <div className={style.postExcerpt}>
    <h3>
      <Link to={`/${category}/${file}`}>
        {title}
      </Link>
    </h3>
    <div className={style.meta}>
      <div className={style.category}>
        <Link to={`/${category}`}>
          {category}
        </Link>
      </div>
      <div className={style.date}>
        <a title={(new Date(date)).toLocaleDateString()}>
          {ago(new Date(date))}
        </a>
      </div>
      <PostTags tags={tags} />
    </div>
    <div className={style.content} dangerouslySetInnerHTML={{ __html: content }} />
  </div>
)

export default PostView
