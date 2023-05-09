import debouncePromise from 'awesome-debounce-promise';

export default function debounce<T extends (...args: any[]) => any>(
  callback: T,
  delay?: number,
  options?: any
) {
  return debouncePromise(callback, delay || 250, options || { leading: true });
}
