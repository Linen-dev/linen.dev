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

export async function fetchImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    var url = URL.createObjectURL(file);
    var image = new Image();

    image.onload = function () {
      if (!image.width || !image.height) {
        return reject(new Error(`Image is empty ${file.name}`));
      }
      resolve({
        width: image.width,
        height: image.height,
      });
      URL.revokeObjectURL(image.src);
    };

    image.onerror = function () {
      reject(new Error(`Couldn't load the image ${file.name}`));
    };

    image.src = url;
  });
}

interface Dimensions {
  width: number;
  height: number;
}

export function getImageDimensionsFromUrl(filename: string): Dimensions | null {
  const extension = getExtension(filename) as string;
  const underscore = filename.lastIndexOf('_');
  const x = filename.lastIndexOf('x');
  if (underscore === -1 || x === -1) {
    return null;
  }
  if (x < underscore) {
    return null;
  }
  const part = filename.substring(
    underscore + 1,
    filename.length - extension.length - 1
  );
  const [part1, part2] = part.split('x');

  const width = Number(part1);
  const height = Number(part2);

  if (width && height) {
    return { width, height };
  }

  return null;
}

export async function getFormData(files: File[]) {
  const data = new FormData();
  for (let index = 0, length = files.length; index < length; index++) {
    const file = files[index];
    if (isImage(file.name)) {
      try {
        const { width, height } = await fetchImageDimensions(file);
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
