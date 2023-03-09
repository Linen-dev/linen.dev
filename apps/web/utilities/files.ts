export const FILE_SIZE_LIMIT_IN_BYTES = 2 * 1024 * 1024;

export function getFileSizeErrorMessage(filename: string) {
  return `File size is bigger than 2MB: ${filename}.`;
}

export function normalizeFilename(filename: string) {
  return filename.replace(/\s|\/|&|"|'|`|>|<|\(|\)|\[|\]|;|:/g, '_');
}
