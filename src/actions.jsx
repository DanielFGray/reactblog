// @flow
import { provideState, softUpdate } from 'freactal'
import { get } from 'axios'
import {
  countBy,
  flatten,
  identity,
  map,
  pipe,
  pluck,
  reverse,
  sortBy,
  toPairs,
  uniq,
  zipObj,
} from 'lodash/fp'

const wrapWithPending = (pendingKey, cb) => effects =>
  effects.setFlag(pendingKey, true)
    .then(cb)
    .then(value => effects.setFlag(pendingKey, false).then(() => value))

const Provider = provideState({
  initialState: () => ({
    posts: [],
    postsPending: false,
  }),
  effects: {
    setFlag: softUpdate((state, key, value) => ({ [key]: value })),
    getPosts: wrapWithPending('postsPending', () => get('/api/posts/index.json')
      .then(res => res.data.content.posts)
      .then(pipe(sortBy('date'), reverse))
      .then(posts => state => ({ ...state, posts }))),
  },
  computed: {
    categories: ({ posts }) => (
      pipe(
        pluck('category'),
        uniq,
      )(posts)),
    tags: ({ posts }) => (
      pipe(
        pluck('tags'),
        flatten,
        countBy(identity),
        toPairs,
        map(zipObj(['name', 'value'])),
        sortBy('value'),
        reverse,
      )(posts)),
  },
})

export { Provider }
