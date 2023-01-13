export function clean(input: object) {
  return Object.entries(input).reduce((output, [key, value]) => {
    if (value) {
      // @ts-ignore
      output[key] = value;
    }
    return output;
  }, {});
}
