// @flow
import { provideState } from 'freactal'
import {
  countBy,
  filter,
  flatten,
  get,
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
        .then(res => res.pages)
        .then(pipe(sortBy('date'), reverse))
        .then(excerpts => state => ({ ...state, excerpts }))),
  },
  computed: {
    pages: pipe(
      get('excerpts'),
      filter(x => x.layout !== 'post'),
      pluck('title'),
    ),
    categories:
      pipe(
        get('excerpts'),
        filter(x => x.layout === 'post'),
        pluck('category'),
        uniq,
      ),
    tags:
      pipe(
        get('excerpts'),
        pluck('tags'),
        flatten,
        countBy(identity),
        toPairs,
        map(zipObj(['name', 'value'])),
        sortBy('value'),
        reverse,
      ),
  },
})

export default Provider
