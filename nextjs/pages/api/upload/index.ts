import { NextApiRequest, NextApiResponse } from 'next/types';
import formidable from 'formidable';
import { readFile } from 'fs/promises';
import UploadService from 'services/upload';
import prisma from 'client';

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

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const form = formidable({
      maxFileSize: 1024 * 1024, // 1mb
    });
    try {
      const files: File[] = await new Promise((resolve, reject) => {
        form.parse(request, function (error, _, files) {
          if (error) {
            reject(error);
          }
          resolve(Object.values(files) as any);
        });
      });
      const data = await Promise.all(
        files.map(async (file) => {
          const buffer = await readFile(file.filepath);
          return await UploadService.upload({
            id: file.filepath.replaceAll('/', '_'),
            name: file.newFilename.replaceAll('/', '_'),
            buffer,
          });
        })
      );

      return response.status(200).json({
        files: data,
      });
    } catch (exception) {
      return response.status(500).json({});
    }
  } else {
    return response.status(404).json({});
  }
}
