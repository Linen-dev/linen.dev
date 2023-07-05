import { uploadFile } from 'services/aws/s3';
import {
  LINEN_STATIC_CDN,
  BUCKET_PREFIX_FOR_ATTACHMENTS,
  BUCKET_PREFIX_FOR_LOGOS,
  BUCKET_PREFIX_FOR_SLACK_IMPORT,
} from 'config';
import { v4 } from 'uuid';
import type { UploadEnum } from '@linen/types';

interface File {
  id: string;
  name?: string;
  buffer: Buffer;
}

const mapFolder: Record<UploadEnum, string> = {
  logos: BUCKET_PREFIX_FOR_LOGOS,
  attachments: BUCKET_PREFIX_FOR_ATTACHMENTS,
  'slack-import': BUCKET_PREFIX_FOR_SLACK_IMPORT,
};

export default class UploadService {
  static async upload(file: File, type: UploadEnum = 'attachments') {
    const folder = mapFolder[type];
    if (!folder) {
      throw new Error('invalid option');
    }
    const path = [folder, v4(), file.name || 'unknown'].join('/');
    await uploadFile({ Key: path, Body: file.buffer });
    return {
      id: file.id,
      url: [LINEN_STATIC_CDN, path].join('/'),
    };
  }
}
