import { NextApiRequest, NextApiResponse } from 'next/types';
import highlightjs from 'highlight.js';
import { cors, preflight } from 'utilities/cors';

export async function create({ input }: { input: string }) {
  const output = highlightjs.highlightAuto(input).value;
  return {
    status: 200,
    data: {
      output,
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);
  if (request.method === 'POST') {
    const { input } = request.body;
    const { status, data } = await create({
      input,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
