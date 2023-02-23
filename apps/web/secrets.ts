export const NOREPLY_EMAIL =
  process.env.NOREPLY_EMAIL || 'no-reply@linendev.com';
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'help@linen.dev';

export const SlackAppIds = [
  'A043PCRLLSF', // local
  'A03DSC9PK4K', // staging
  'A0306BRR6AD', // prod
];

export const BUCKET_PREFIX_FOR_ATTACHMENTS = 'attachments';
export const LINEN_ASSETS_CDN = process.env.LINEN_STATIC_CDN;
export const LINEN_URL = 'https://linen.dev';

export const PAGE_SIZE = 30;
