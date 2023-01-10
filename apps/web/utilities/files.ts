export const FILE_SIZE_LIMIT_IN_BYTES = 1048576;

export function getFileSizeErrorMessage(filename: string) {
  return `File size is bigger than 1MB: ${filename}.`;
}

export function normalizeFilename(filename: string) {
  return filename.replace(/\s|\/|&|"|'|`|>|<|\(|\)|\[|\]|;|:/g, '_');
}
