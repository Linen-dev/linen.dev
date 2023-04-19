import { LINEN_STATIC_CDN, S3_UPLOAD_BUCKET } from 'secrets';

export const toObject = <T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K
): Record<string, T> => arr.reduce((a, b) => ({ ...a, [b[key]]: b }), {});

export function cleanUpUrl(reqUrl?: string) {
  if (!reqUrl) return;
  const url = new URL(reqUrl, 'http://fa.ke');
  url.searchParams.delete('customDomain');
  return url.toString().split('http://fa.ke').join('');
}

export function replaceS3byCDN(url: string | undefined) {
  try {
    if (url && url.indexOf(S3_UPLOAD_BUCKET!) > -1) {
      return [LINEN_STATIC_CDN!, ...url.split('/').slice(3)].join('/');
    }
  } catch (error) {}
  return url;
}


export const playNotificationSound = async (volume: number) => {
  console.log('play notification');
  try {
    const file = '/alert.mp3';
    const audio = new Audio(file);
    audio.volume = volume;

    await audio?.play();
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};
