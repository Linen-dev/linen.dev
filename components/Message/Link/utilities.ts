const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

export function isImage(href: string): boolean {
  const extension = href.split('.').pop();
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

export function isUrlValid(url: string): boolean {
  return !url.startsWith('http://-') && !url.startsWith('https://-');
}
