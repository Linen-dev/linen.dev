export const FILE_SIZE_LIMIT_IN_BYTES = 2 * 1024 * 1024;

export function getFileSizeErrorMessage(filename: string) {
  return `File size is bigger than 2MB: ${filename}.`;
}

export function normalizeFilename(filename: string) {
  return filename.replace(/\s|\/|&|"|'|`|>|<|\(|\)|\[|\]|;|:/g, '_');
}

const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

export function isImage(name: string): boolean {
  const extension = name.split('.').pop();
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}
