const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

export function isImage(href: string): boolean {
  const extension = href.split('.').pop();
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

function isYoutubeEmbedUrl(href: string) {
  return (
    href.startsWith('https://www.youtube.com/embed/') ||
    href.startsWith('https://youtube.com/embed/')
  );
}

function isYoutubeWatchUrl(href: string): boolean {
  return (
    href.startsWith('https://www.youtube.com/watch') ||
    href.startsWith('https://youtube.com/watch')
  );
}

function isYoutubeUrl(href: string): boolean {
  return isYoutubeEmbedUrl(href) || isYoutubeWatchUrl(href);
}

export function isVideo(href: string): boolean {
  return isYoutubeUrl(href);
}

export function isUrlValid(url: string): boolean {
  return !url.startsWith('http://-') && !url.startsWith('https://-');
}

export function normalizeVideoUrl(url: string): string {
  if (isYoutubeWatchUrl(url)) {
    const params = new URLSearchParams(url.split('?')[1]);
    const version = params.get('v');
    return `https://www.youtube.com/embed/${version}`;
  }
  return url;
}
