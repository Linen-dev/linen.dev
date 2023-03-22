export function getSelectedText(): string {
  if (typeof document.getSelection === 'function') {
    const selection = document.getSelection();
    return selection?.toString() || '';
  } else {
    return '';
  }
}
