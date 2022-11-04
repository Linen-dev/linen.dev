import { uploadFile } from 'services/aws/s3';
import {
  BUCKET_PREFIX_FOR_ATTACHMENTS,
  LINEN_ASSETS_CDN,
} from '../../constants';

interface File {
  id: string;
  name?: string;
  buffer: Buffer;
}

export default class UploadService {
  static async upload(file: File) {
    const path = [
      BUCKET_PREFIX_FOR_ATTACHMENTS,
      file.id,
      file.name || 'unknown',
    ].join('/');
    await uploadFile(path, file.buffer);
    return {
      id: file.id,
      url: [LINEN_ASSETS_CDN, path].join('/'),
    };
  }
}
