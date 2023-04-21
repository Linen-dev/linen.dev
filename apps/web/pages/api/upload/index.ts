import { NextApiRequest, NextApiResponse } from 'next/types';
import formidable from 'formidable';
import { readFile } from 'fs/promises';
import UploadService from 'services/upload';
import PermissionsService from 'services/permissions';
import {
  normalizeFilename,
  FILE_SIZE_LIMIT_IN_BYTES,
} from '@linen/utilities/files';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface File {
  filepath: string;
  mimetype: string;
  mtime: string;
  newFilename: string;
  originalFilename: string;
  size: number;
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const permissions = await PermissionsService.get({
      request,
      response,
      params: request.query,
    });

    if (!permissions.chat) {
      return response.status(401).json({});
    }

    // we could refactor this to use fileWriteStreamHandler and send to s3 directly
    const form = formidable({
      maxFileSize: FILE_SIZE_LIMIT_IN_BYTES,
      maxFields: 10,
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    try {
      const files: File[] = await new Promise((resolve, reject) => {
        form.parse(request, function (error, _, files) {
          if (error) {
            return reject(error);
          }
          resolve(Object.values(files) as any);
        });
      });
      const data = await Promise.all(
        files.map(async (file) => {
          const buffer = await readFile(file.filepath);
          const name = normalizeFilename(file.originalFilename);
          return await UploadService.upload({
            id: name,
            name,
            buffer,
          });
        })
      );

      return response.status(200).json({
        files: data,
      });
    } catch (exception) {
      // we could improve this by using `formidable.errors` and detecting codes
      console.error(exception);
      return response.status(500).json({});
    }
  } else {
    return response.status(404).json({});
  }
}

export default handler;
