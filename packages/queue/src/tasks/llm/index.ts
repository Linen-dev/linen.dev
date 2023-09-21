import axios from 'axios';
import { JobHelpers } from 'graphile-worker';
import { z } from 'zod';
import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import LinenSdk from '@linen/sdk';
import { MessageFormat } from '@linen/types';
import crypto from 'crypto';
import { prisma } from '@linen/database';

const linenSdk = new LinenSdk({
  apiKey: process.env.INTERNAL_API_KEY!,
  type: 'internal',
  linenUrl: appendProtocol(getIntegrationUrl()),
});

const llmServer = axios.create({
  // TODO: var
  // baseURL: `http://llm.stage.linendev.com:3000`,
  baseURL: `http://localhost:3001`,
  headers: {
    ['x-api-internal']: process.env.INTERNAL_API_KEY!,
  },
});

// TODO: move to types
type PredictResponse = {
  text: string;
  sourceDocuments: {
    pageContent: string;
    metadata: {
      source: string;
      loc: {
        lines: {
          from: number;
          to: number;
        };
      };
      title?: string;
      language?: string;
    };
  }[];
};

async function llmPredict(data: { communityName: string; query: string }) {
  const r = await llmServer.post<PredictResponse>('/predict', data);
  return r.data;
}

export const llmQuestion = async (payload: any, helpers: JobHelpers) => {
  const parsedPayload = z
    .object({
      accountId: z.string().uuid(),
      authorId: z.string().uuid(),
      channelId: z.string().uuid(),
      threadId: z.string().uuid(),
      communityName: z.string(),
    })
    .parse(payload);

  const { accountId, authorId, channelId, threadId, communityName } =
    parsedPayload;

  const thread = await prisma.threads.findUnique({
    include: { messages: true },
    where: { id: threadId },
    rejectOnNotFound: true,
  });

  const llmResponse = await llmPredict({
    communityName,
    query: thread.messages.map((m) => m.body).join(' '),
  });

  const body = parseBody(llmResponse);

  await linenSdk.createNewMessage({
    accountId,
    authorId,
    body,
    channelId,
    externalMessageId: crypto.randomUUID(),
    threadId,
    messageFormat: MessageFormat.LINEN,
  });
};

function parseBody(llmResponse: PredictResponse): string {
  // TODO: if is a url, show it, otherwise, it will be a threadId, we should build the url
  // TODO: source documents can be dup, we should clean up these
  return [
    llmResponse.text,
    'References:',
    llmResponse.sourceDocuments.map((s) => `- ${s.metadata.source}`).join('\n'),
  ].join('\n\n');
}

// TODO: follow up (replies)
