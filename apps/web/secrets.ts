export const NOREPLY_EMAIL =
  process.env.NOREPLY_EMAIL || 'no-reply@linendev.com';
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'help@linen.dev';

export const SlackAppIds = [
  'A043PCRLLSF', // local
  'A03DSC9PK4K', // staging
  'A0306BRR6AD', // prod
];

export const BUCKET_PREFIX_FOR_LOGOS = 'logos';
export const BUCKET_PREFIX_FOR_ATTACHMENTS = 'attachments';
export const LINEN_STATIC_CDN = process.env.LINEN_STATIC_CDN;
export const S3_UPLOAD_BUCKET = process.env.S3_UPLOAD_BUCKET;
export const LINEN_URL = 'https://www.linen.dev';

export const PAGE_SIZE = 30;
