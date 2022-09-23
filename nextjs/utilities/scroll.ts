export function scrollToBottom(node: HTMLElement) {
  if (node) {
    node.scrollTop = node.scrollHeight;
  }
}
