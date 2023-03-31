import { NextApiRequest, NextApiResponse } from 'next/types';
import highlightjs from 'highlight.js';

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
  if (request.method === 'POST') {
    const { input } = request.body;
    const { status, data } = await create({
      input,
    });
    return response.status(status).json(data || {});
  }
  return response.status(404).json({});
}
