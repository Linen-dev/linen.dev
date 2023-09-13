export const countOccurrences = <T extends string | number>(
  arr: T[]
): Record<T, number> =>
  arr.reduce(
    (prev, curr) => ((prev[curr] = ++prev[curr] || 1), prev),
    {} as Record<T, number>
  );
