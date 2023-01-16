import cache from './cache';

export default function memoize<R, T extends (...args: any[]) => Promise<R>>(
  fn: T
): T {
  const g = async (...args: any[]) => {
    const key = args[0];
    let result = cache.get(fn.name + key);
    if (!result) {
      result = await fn(args);
      if (!!result) {
        cache.set(fn.name + key, result);
      }
    }
    return result;
  };
  return g as T;
}
