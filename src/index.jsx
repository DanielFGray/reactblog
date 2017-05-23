// @flow
import React from 'react'
import { render } from 'react-dom'

const App = () => (
  <div>Hello World</div>
)

document.addEventListener('DOMContentLoaded', () =>
  render(<App />, document.getElementById('root')))
