// @flow
import React from 'react'
import { injectState } from 'freactal'
import { NavLink } from 'react-router-dom'

import style from './style.sss'

const titleCase = (str: string) =>
  str[0].toUpperCase().concat(str.slice(1).toLowerCase())

const TagList = ({ categories, pages }: {
  categories: Array<string>,
  pages: Array<string>,
}) => {
  const links = pages.concat(categories)
  if (! links.length) {
    return null
  }
  return (
    <nav>
      <ul className={style.nav}>
        <li><NavLink to="/" exact activeClassName={style.activeLinkStyle}>Home</NavLink></li>
        {links.map(e => (
          <li key={e}>
            <NavLink to={`/${e.toLowerCase()}`} activeClassName={style.activeLinkStyle}>
              {titleCase(e)}
            </NavLink>
          </li>))}
      </ul>
    </nav>
  )
}

export default injectState(TagList, ['categories', 'pages'])
