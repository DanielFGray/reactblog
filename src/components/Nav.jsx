// @flow
import React from 'react'
import { injectState } from 'freactal'
import { Link } from 'react-router-dom'

import style from './Nav.sss'

const TagList = ({ categories }: { categories: Array<string> }) => (
  categories.length
  ? <ul className={style.nav}>
    <li><Link to="/">home</Link></li>
    {categories.map(e => (
      <li key={e}>
        <Link to={`/${e}`}>
          {e}
        </Link>
      </li>))}
  </ul>
  : null
)

export default injectState(TagList, ['categories'])
