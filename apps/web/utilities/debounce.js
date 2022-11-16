import debouncePromise from 'awesome-debounce-promise';

export default function debounce(callback, delay, options) {
  return debouncePromise(callback, delay || 250, options || { leading: true });
}
