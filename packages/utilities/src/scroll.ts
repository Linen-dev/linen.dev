export function scrollToBottom(node: HTMLElement, smooth?: boolean) {
  if (node) {
    if (node.scroll && smooth) {
      node.scroll({
        top: node.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      node.scrollTop = node.scrollHeight;
    }
  }
}

const SCROLL_AT_BOTTOM_TOLERANCE = 3

export function isScrollAtBottom(node: HTMLElement) {
  if (!node) {
    return false;
  }
  return (
    Math.abs(node.scrollHeight - node.scrollTop - node.clientHeight) <= SCROLL_AT_BOTTOM_TOLERANCE
  );
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
