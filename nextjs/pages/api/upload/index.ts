import { NextApiRequest, NextApiResponse } from 'next/types';
import UploadService from 'services/upload';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    console.log(request);
    return response.status(200).json({});
  } else {
    return response.status(404).json({});
  }
}
