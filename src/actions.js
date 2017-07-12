// @flow
import { provideState } from 'freactal'
import {
  countBy,
  filter,
  flatten,
  identity,
  map,
  memoize,
  pipe,
  pluck,
  prop,
  reverse,
  sortBy,
  toPairs,
  uniq,
  values,
  zipObj,
} from 'ramda'

const wrapWithPending = (pendingKey, cb) => (effects, ...a) =>
  effects.setFlag(pendingKey, true)
    .then(() => cb(effects, ...a))
    .then(value => effects.setFlag(pendingKey, false).then(() => value))

const getFromAPI = memoize((route: string) =>
  fetch(`/api/${route}.json`)
    .then(x => x.json())
    .then(x => x))

const Provider = provideState({
  initialState: () => ({
    post: {},
    postPending: false,
    excerpts: [],
    excerptsPending: false,
    page: {},
    pagePending: false,
  }),
  effects: {
    setFlag: (effects, key, value) => state => ({ ...state, [key]: value }),
    getPage: wrapWithPending('pagePending', (_, file) =>
      getFromAPI(`${file}`)
        .then(page => state => ({ ...state, page }))),
    getPost: wrapWithPending('postPending', (_, file) =>
      getFromAPI(`posts/${file}`)
        .then(post => state => ({ ...state, post }))),
    getPosts: wrapWithPending('excerptsPending', () =>
      getFromAPI('index')
        .then(pipe(prop('content'), values, sortBy(prop('date')), reverse))
        .then(excerpts => state => ({ ...state, excerpts }))),
  },
  computed: {
    pages: pipe(
      prop('excerpts'),
      filter(x => x.layout !== 'post'),
      pluck('title'),
      values,
    ),
    categories:
      pipe(
        prop('excerpts'),
        filter(x => x.layout === 'post'),
        pluck('category'),
        values,
        uniq,
      ),
    tags:
      pipe(
        prop('excerpts'),
        pluck('tags'),
        values,
        flatten,
        countBy(identity),
        toPairs,
        map(zipObj(['name', 'value'])),
        sortBy(prop('value')),
        reverse,
      ),
  },
})

export default Provider
