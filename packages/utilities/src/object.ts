export function clean(input: any): any {
  return Object.entries(input).reduce((output, [key, value]) => {
    if (value) {
      // @ts-ignore
      output[key] = value;
    }
    return output;
  }, {});
}

export const toObject = <T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K
): Record<string, T> => arr.reduce((a, b) => ({ ...a, [b[key]]: b }), {});

export function sortBySentAtAsc(a: { sentAt: bigint }, b: { sentAt: bigint }) {
  return Number(a.sentAt) - Number(b.sentAt);
}

export function sortByDisplayOrder(
  a: { displayOrder?: number },
  b: { displayOrder?: number }
) {
  const displayOrder1 =
    typeof a.displayOrder === 'number' ? a.displayOrder : Infinity;
  const displayOrder2 =
    typeof b.displayOrder === 'number' ? b.displayOrder : Infinity;
  if (displayOrder1 === displayOrder2) {
    return 0;
  }
  return displayOrder1 > displayOrder2 ? 1 : -1;
}
