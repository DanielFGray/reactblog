// @flow
import React from 'react'

import style from './style.sss'

const Spinner = () => (
  <div className={style.spinner}>
    <div>
      <span>{`{`}</span>
      <span>{`}`}</span>
    </div>
  </div>
)

export default Spinner
