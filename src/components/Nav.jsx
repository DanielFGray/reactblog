// @flow
import React from 'react'
import { injectState } from 'freactal'
import { NavLink } from 'react-router-dom'

import style from './Nav.sss'

const TagList = ({ categories }: { categories: Array<string> }) => (
  categories.length ?
    <nav>
      <ul className={style.nav}>
        <li><NavLink to="/" exact activeClassName={style.activeLinkStyle}>home</NavLink></li>
        {categories.map(e => (
          <li key={e}>
            <NavLink to={`/${e}`} activeClassName={style.activeLinkStyle}>
              {e}
            </NavLink>
          </li>))}
      </ul>
    </nav>
  : null
)

export default injectState(TagList, ['categories'])
