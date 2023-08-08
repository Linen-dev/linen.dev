import { getImageDimensionsFromUrl } from '@linen/utilities/files';

export function getWidthHeight(src: string) {
  const dimensions = getImageDimensionsFromUrl(src);
  return calculateDimensions(dimensions);
}

interface Dimensions {
  width: number;
  height: number;
}

export function calculateDimensions(dimensions: Dimensions | null): Dimensions {
  if (!dimensions || !dimensions.width || !dimensions.height) {
    return { width: 200, height: 200 };
  }

  if (dimensions.height > 400 || dimensions.width > 400) {
    let height = dimensions.height;
    let width = dimensions.width;
    while (height > 400 || width > 400) {
      height = Math.floor(height / 2);
      width = Math.floor(width / 2);
    }
    return {
      width,
      height,
    };
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
  };
}
