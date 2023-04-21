import { LINEN_STATIC_CDN, S3_UPLOAD_BUCKET } from 'secrets';

export function replaceS3byCDN(url: string | undefined) {
  try {
    if (url && url.indexOf(S3_UPLOAD_BUCKET!) > -1) {
      return [LINEN_STATIC_CDN!, ...url.split('/').slice(3)].join('/');
    }
  } catch (error) {}
  return url;
}
