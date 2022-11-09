import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'client';
import serializeUser from 'serializers/user';
import formidable from 'formidable';
import { readFile } from 'fs/promises';
import UploadService from 'services/upload';
import Session from 'services/session';
import { FILE_SIZE_LIMIT_IN_BYTES } from 'utilities/files';

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
    const currentUser = await Session.user(request, response);

    if (!currentUser) {
      return response.status(401).json({});
    }

    // we could refactor this to use fileWriteStreamHandler and send to s3 directly
    const form = formidable({
      maxFileSize: FILE_SIZE_LIMIT_IN_BYTES,
      maxFields: 1,
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
      const file = files[0];
      const buffer = await readFile(file.filepath);
      const name = file.originalFilename.replace(/\//g, '_');
      const data = await UploadService.upload({
        id: name,
        name,
        buffer,
      });

      if (!data || !data.url) {
        console.error('Failed to upload an avatar.');
        return response.status(500).json({});
      }

      const user = await prisma.users.update({
        where: {
          id: currentUser.id,
        },
        data: {
          profileImageUrl: data.url,
        },
      });

      return response.status(200).json({
        user: serializeUser(user),
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
