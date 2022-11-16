export function memoize<R, T extends (...args: any[]) => Promise<R>>(fn: T): T {
  const g = async (...args: any[]) => {
    return await fn(...args);
  };
  return g as T;
}
