const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

export function isImage(href: string): boolean {
  const extension = href.split('.').pop();
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

export function isYoutubeShortUrl(href: string): boolean {
  return href.startsWith('https://youtu.be/');
}

export function isYoutubeEmbedUrl(href: string) {
  return (
    href.startsWith('https://www.youtube.com/embed/') ||
    href.startsWith('https://youtube.com/embed/')
  );
}

export function isYoutubeWatchUrl(href: string): boolean {
  return (
    href.startsWith('https://www.youtube.com/watch') ||
    href.startsWith('https://youtube.com/watch')
  );
}

function isYoutubeUrl(href: string): boolean {
  return (
    isYoutubeEmbedUrl(href) ||
    isYoutubeWatchUrl(href) ||
    isYoutubeShortUrl(href)
  );
}

export function isVideo(href: string): boolean {
  return isYoutubeUrl(href);
}

export function isTweet(href: string): boolean {
  return href.startsWith('https://twitter.com/status/');
}

export function isUrlValid(url: string): boolean {
  return !url.startsWith('http://-') && !url.startsWith('https://-');
}
