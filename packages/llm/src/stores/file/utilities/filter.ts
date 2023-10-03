const SHORT_VERSION_REGEX = /\/v\d+\.\d+\//;
const LONG_VERSION_REGEX = /\/v\d+\.\d+\.\d+\//;

function isOlderDocumentationPath(url: string): boolean {
  if (!url) {
    return false;
  }
  return !!url.match(SHORT_VERSION_REGEX) || !!url.match(LONG_VERSION_REGEX);
}

const NOT_FOUND_TITLE = '404 not found';

function is404Title(title: string): boolean {
  if (!title) {
    return false;
  }
  return title.toLowerCase().includes(NOT_FOUND_TITLE);
}

function isFileInvalid({ metadata, pageContent = '' }): boolean {
  const isLegacyDocumentation =
    metadata.source && metadata.source.includes('/legacy/');
  const isOlderDocumentation = isOlderDocumentationPath(metadata.source);
  const has404Status = is404Title(metadata.title);
  const pageRequiresJavaScript = pageContent.includes(
    'Just a moment...\n\nEnable JavaScript and cookies to continue'
  );
  const isEmpty = pageContent.trim() === '';
  return (
    isLegacyDocumentation ||
    isOlderDocumentation ||
    has404Status ||
    pageRequiresJavaScript ||
    isEmpty
  );
}

export function isFileValid(file): boolean {
  return !isFileInvalid(file);
}
