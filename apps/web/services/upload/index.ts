import { uploadFile } from 'services/aws/s3';
import {
  BUCKET_PREFIX_FOR_ATTACHMENTS,
  BUCKET_PREFIX_FOR_LOGOS,
  LINEN_STATIC_CDN,
} from 'secrets';
import { v4 } from 'uuid';

interface File {
  id: string;
  name?: string;
  buffer: Buffer;
}

export default class UploadService {
  static async upload(file: File, type: 'logo' | 'attachment' = 'attachment') {
    const path = [
      type === 'attachment'
        ? BUCKET_PREFIX_FOR_ATTACHMENTS
        : BUCKET_PREFIX_FOR_LOGOS,
      v4(),
      file.name || 'unknown',
    ].join('/');
    await uploadFile({ Key: path, Body: file.buffer });
    return {
      id: file.id,
      url: [LINEN_STATIC_CDN, path].join('/'),
    };
  }
}
