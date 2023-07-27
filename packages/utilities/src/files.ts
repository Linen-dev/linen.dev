import { getImageDimensions } from './image';

export const FILE_SIZE_LIMIT_IN_BYTES = 2 * 1024 * 1024;

export function getExtension(filename: string) {
  return filename.split('.').pop();
}

export function getFileSizeErrorMessage(filename: string) {
  return `File size is bigger than 2MB: ${filename}.`;
}

export function normalizeFilename(filename: string) {
  return filename.replace(/\s|\/|&|"|'|`|>|<|\(|\)|\[|\]|;|:/g, '_');
}

const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

export function isImage(name: string): boolean {
  const extension = getExtension(name);
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

export async function getFormData(files: File[]) {
  const data = new FormData();
  for (let index = 0, length = files.length; index < length; index++) {
    const file = files[index];
    if (isImage(file.name)) {
      try {
        const { width, height } = await getImageDimensions(file);
        const extension = getExtension(file.name) as string;
        const name =
          file.name.substring(0, file.name.length - extension.length - 1) +
          `_${width}x${height}.${extension}`;
        data.append(`file-${index}`, file, name);
      } catch (exception) {
        data.append(`file-${index}`, file, file.name);
      }
    } else {
      data.append(`file-${index}`, file, file.name);
    }
  }
  return data;
}
