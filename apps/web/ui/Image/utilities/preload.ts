export const cache: { [key: string]: Promise<HTMLImageElement> } = {};

export default async function preload(src: string): Promise<HTMLImageElement> {
  if (cache.hasOwnProperty(src)) {
    return cache[src];
  }
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image at ${src}`));
    image.src = src;
  }) as Promise<HTMLImageElement>;
  cache[src] = promise;
  return promise;
}
