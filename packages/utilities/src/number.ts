export function format(number: number): string {
  try {
    return number.toLocaleString();
  } catch (exception) {
    return number.toString();
  }
}
