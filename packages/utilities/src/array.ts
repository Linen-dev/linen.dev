export function move(array: any[], from: number, to: number) {
  const max = array.length - 1;
  if (from > max || to > max || from < 0 || to < 0) {
    return array;
  }
  const copy = [...array];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

export function unionBy(
  array1: { [key: string]: any }[],
  array2: { [key: string]: any }[],
  param: string
) {
  const ids = array1.map((object) => object[param]);
  const result = [...array1];
  array2.forEach((object) => {
    if (ids.indexOf(object[param]) === -1) {
      result.push(object);
    }
  });
  return result;
}
