export function scrollToBottom(node: HTMLElement) {
  if (node) {
    node.scrollTop = node.scrollHeight;
  }
}

export function isInViewport(node: HTMLElement) {
  if (!node) {
    return false;
  }
  const { top, left, bottom, right } = node.getBoundingClientRect();
  return (
    top >= 0 &&
    left >= 0 &&
    bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
