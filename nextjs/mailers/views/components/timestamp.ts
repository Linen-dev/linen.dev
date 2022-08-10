import div from './div';

export default function timestamp() {
  return div(
    {
      background: '#f9fafb',
      style: 'color: #f9fafb; height: 0;',
    },
    ['Timestamp: #' + Date.now()]
  );
}
