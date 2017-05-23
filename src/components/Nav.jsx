// @flow
import React from 'react'
import { injectState } from 'freactal'

const TagList = ({ categories }: { categories: Array<string> }) => (
  <ul>
    {categories.map(e => (
      <li key={e}>
        {e}
      </li>
    ))}
  </ul>
)

export default injectState(TagList, [ 'categories' ])
