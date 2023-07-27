export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    var url = URL.createObjectURL(file);
    var image = new Image();

    image.onload = function () {
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
