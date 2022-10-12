import { qs } from 'utilities/url';
import LRU from 'lru-cache';

const options = {
  max: 500,
  ttl: 1000 * 60 * 15,
};

const CacheSingleton = (function () {
  let cache: any;

  function createInstance() {
    return new LRU(options);
  }

  return {
    getInstance: function () {
      if (!cache) {
        cache = createInstance();
      }
      return {
        memoize<R, T extends (args: any) => Promise<R>>(fn: T): T {
          const g = async (args: any) => {
            const key = qs(args) as string;
            let result = cache.get(fn.name + key);
            if (!!result) {
              process.env.NODE_ENV === 'development' &&
                console.log('hit cache');
            }
            if (!result) {
              result = await fn(args);
              if (!!result) {
                cache.set(fn.name + key, result);
              }
            }
            return result;
          };
          return g as T;
        },
      };
    },
  };
})();

export default CacheSingleton;
