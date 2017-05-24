// @flow
import { provideState } from 'freactal'
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
    post: {},
    postsPending: false,
    excerpts: [],
    excerptsPending: false,
  }),
  effects: {
    setFlag: (effects, key, value) => state => ({ ...state, [key]: value }),
    getPost: (effects, file) => effects.setFlag('postPending', true)
      .then(() => get(`/api/posts/${file}.json`))
      .then(res => res.data)
      .then(post => effects.setFlag('postPending', false).then(() => post))
      .then(post => state => ({ ...state, post })),
    getPosts: wrapWithPending('excerptsPending', () =>
      get('/api/posts/index.json')
        .then(res => res.data.content.posts)
        .then(pipe(sortBy('date'), reverse))
        .then(excerpts => state => ({ ...state, excerpts }))),
  },
  computed: {
    categories: ({ excerpts }) => (
      pipe(
        pluck('category'),
        uniq,
      )(excerpts)),
    tags: ({ excerpts }) => (
      pipe(
        pluck('tags'),
        flatten,
        countBy(identity),
        toPairs,
        map(zipObj(['name', 'value'])),
        sortBy('value'),
        reverse,
      )(excerpts)),
  },
})

export { Provider }
