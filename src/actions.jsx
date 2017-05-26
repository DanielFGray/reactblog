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

const wrapWithPending = (pendingKey, cb) => (effects, ...a) =>
  effects.setFlag(pendingKey, true)
    .then(() => cb(effects, ...a))
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
    getPost: wrapWithPending('postPending', file =>
      get(`/api/posts/${file}.json`)
        .then(res => res.data)
        .then(post => state => ({ ...state, post }))),
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
