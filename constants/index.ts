export const BUCKET_PREFIX_FOR_ATTACHMENTS = 'attachments';
export const LINEN_ASSETS_CDN = `https://${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`;
export const CacheControl = 'public, s-maxage=300, stale-while-revalidate=599';
