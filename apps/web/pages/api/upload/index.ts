import { NextApiRequest, NextApiResponse } from 'next/types';
import formidable from 'formidable';
import { readFile } from 'fs/promises';
import UploadService from 'services/upload';
import PermissionsService from 'services/permissions';
import {
  normalizeFilename,
  FILE_SIZE_LIMIT_IN_BYTES,
} from '@linen/utilities/files';
import { cors, preflight } from 'utilities/cors';
import { z } from 'zod';

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
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);

  if (request.method === 'POST') {
    const schema = z.object({
      communityId: z.string(),
      type: z.enum(['logo', 'attachment']),
    });

    const parsedReq = schema.parse(request.query);

    const permissions = await PermissionsService.get({
      request,
      response,
      params: { communityId: parsedReq.communityId },
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
          return await UploadService.upload(
            {
              id: name,
              name,
              buffer,
            },
            parsedReq.type
          );
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
  }
  return response.status(405).json({});
}

export default handler;
