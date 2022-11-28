import debouncePromise from 'awesome-debounce-promise';

export default function debounce(callback: any, delay?: number, options?: any) {
  return debouncePromise(callback, delay || 250, options || { leading: true });
}
