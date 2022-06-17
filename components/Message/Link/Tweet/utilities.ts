export function getTweetId(src: string) {
  const match = src.match(/https:\/\/twitter\.com\/.*\/status\/(\d+)/);
  return match ? match[1] : '';
}
