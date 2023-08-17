export function tc<T>(fn: () => T) {
  try {
    return fn();
  } catch (error) {
    return null;
  }
}
