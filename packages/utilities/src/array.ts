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
