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
  return isYoutubeUrl(href) || href.endsWith('.mov');
}

export function isMail(href: string): boolean {
  return href.startsWith('mailto:');
}

export function isUrlValid(url: string): boolean {
  return !url.startsWith('http://-') && !url.startsWith('https://-');
}
