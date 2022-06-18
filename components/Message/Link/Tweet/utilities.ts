export function getTweetId(src: string) {
  const parts = src.split('/');
  const id = parts[parts.length - 1];
  return id.split('?')[0];
}
