import { NextApiRequest, NextApiResponse } from 'next/types';
import highlightjs from 'highlight.js';
import { cors, preflight } from 'utilities/cors';

const LANGUAGES = highlightjs.listLanguages();

export async function create({
  input,
  language,
}: {
  input: string;
  language: string;
}) {
  try {
    const output =
      language && LANGUAGES.includes(language)
        ? highlightjs.highlight(language, input).value
        : highlightjs.highlightAuto(input).value;
    return {
      status: 200,
      data: {
        output,
      },
    };
  } catch (exception) {
    return {
      status: 200,
      data: {
        output: input,
      },
    };
  }
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
    const { input, language } = request.body;
    const { status, data } = await create({
      input,
      language,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
