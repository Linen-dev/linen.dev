import LRU from 'lru-cache';

const options = {
  max: 500,
  ttl: 1000 * 60 * 15,
};

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var cache: LRU<string, any> | undefined;
}

export const cache = global.cache || new LRU(options);

if (process.env.NODE_ENV !== 'production') {
  global.cache = cache;
}

export default cache;
