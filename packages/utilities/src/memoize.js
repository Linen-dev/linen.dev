let cache = {};
/**
 *
 * @param {*} fn must be a named function
 * @returns cached promise
 */
export const promiseMemoize = (fn) => {
  return (...args) => {
    let strX = fn.name + JSON.stringify(args);
    return strX in cache
      ? cache[strX]
      : (cache[strX] = fn(...args).catch((x) => {
          delete cache[strX];
          return x;
        }));
  };
};
