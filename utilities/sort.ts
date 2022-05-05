export const sortBy = <T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  k: K
): T[] => arr.concat().sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0));
