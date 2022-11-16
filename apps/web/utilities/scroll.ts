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

export function isScrollAtBottom(node: HTMLElement) {
  if (!node) {
    return false;
  }
  return (
    Math.ceil(node.scrollTop) + Math.ceil(node.clientHeight) ===
    Math.ceil(node.scrollHeight)
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
