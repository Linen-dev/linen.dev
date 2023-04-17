import { uploadFile } from 'services/aws/s3';
import { BUCKET_PREFIX_FOR_ATTACHMENTS, LINEN_STATIC_CDN } from 'secrets';
import { v4 } from 'uuid';

interface File {
  id: string;
  name?: string;
  buffer: Buffer;
}

export default class UploadService {
  static async upload(file: File) {
    const path = [
      BUCKET_PREFIX_FOR_ATTACHMENTS,
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
