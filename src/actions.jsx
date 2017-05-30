// @flow
import { provideState } from 'freactal'
import {
  countBy,
  flatten,
  identity,
  map,
  memoize,
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

const getFromAPI = memoize((route: string) =>
  fetch(`api/${route}.json`)
    .then(x => x.json())
    .then(x => x))

const Provider = provideState({
  initialState: () => ({
    post: {},
    postPending: false,
    excerpts: [],
    excerptsPending: false,
  }),
  effects: {
    setFlag: (effects, key, value) => state => ({ ...state, [key]: value }),
    getPost: wrapWithPending('postPending', (_, file) =>
      getFromAPI(`posts/${file}`)
        .then(post => state => ({ ...state, post }))),
    getPosts: wrapWithPending('excerptsPending', () =>
      getFromAPI('posts/index')
        .then(res => res.content.posts)
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

export default Provider
