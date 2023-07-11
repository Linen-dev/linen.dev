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
export const BUCKET_PREFIX_FOR_SLACK_IMPORT = 'slack-import';

export const LINEN_STATIC_CDN = process.env.LINEN_STATIC_CDN;
export const S3_UPLOAD_BUCKET = process.env.S3_UPLOAD_BUCKET;
export const LINEN_URL = 'https://www.linen.dev';

export const PAGE_SIZE = 30;

export const config = {
  channel: {
    defaultName: 'main',
  },
  linen: {
    squareLogo:
      'https://static.main.linendev.com/logos/logo05dab315-0b75-415b-aca4-f56a1867f045.png',
    communityId: '09011dac-952f-4796-8892-4ea29038f5a1',
    feedChannelId: 'b876a398-be14-4b2f-970d-835a9e61b3d4',
    bot: {
      externalId: 'linen-bot',
      displayName: 'LinenBot',
    },
  },
};
