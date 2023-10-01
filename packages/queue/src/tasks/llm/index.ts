import axios from 'axios';
import { JobHelpers } from 'graphile-worker';
import { z } from 'zod';
import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import LinenSdk from '@linen/sdk';
import { MessageFormat, accounts } from '@linen/types';
import crypto from 'crypto';
import { prisma } from '@linen/database';
import { getThreadUrl } from '@linen/utilities/url';
import { Logger } from '../../helpers/logger';

const linenSdk = new LinenSdk({
  apiKey: process.env.INTERNAL_API_KEY!,
  type: 'internal',
  linenUrl: appendProtocol(getIntegrationUrl()),
});

const baseURL =
  process.env.LLM_SERVICE_URL || 'http://llm.stage.linendev.com:3000';

const llmServer = axios.create({
  baseURL: baseURL,
  headers: {
    ['x-api-internal']: process.env.INTERNAL_API_KEY!,
  },
});

// TODO: move to types
type SourceDocument = {
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
};

type LLMPredictionResponse = {
  text: string;
  sourceDocuments: SourceDocument[];
};

async function llmPredict(data: { communityName: string; query: string }) {
  const r = await llmServer.post<LLMPredictionResponse>('/predict', data);
  return r.data;
}

export const llmQuestion = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);

  logger.info(payload);

  try {
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

    const thread = await prisma.threads.findUniqueOrThrow({
      include: { messages: true, channel: true },
      where: { id: threadId },
    });

    logger.info({ llm: `found thread ${thread.id}` });

    const llmResponse = await llmPredict({
      communityName,
      query: thread.messages.map((m) => m.body).join(' '),
    });

    logger.info({ llm: `llm response ready` });

    const threadAccountId = thread.channel.accountId;

    if (threadAccountId) {
      const account = await prisma.accounts.findUnique({
        where: {
          id: threadAccountId,
        },
      });

      if (account) {
        const body = await parseBody(llmResponse, { account, communityName });

        logger.info({
          llm: `creating a new linen message for thread ${threadId}`,
        });

        await linenSdk.createNewMessage({
          accountId,
          authorId,
          body,
          channelId,
          externalMessageId: crypto.randomUUID(),
          threadId,
          messageFormat: MessageFormat.LINEN,
        });
      }
    }
  } catch (exception: any) {
    logger.error(exception.message);
  }
};

export function getReferences(documents: SourceDocument[]): string[] {
  const sources: string[] = [];
  documents.forEach((document) => {
    const source = document.metadata.source;
    if (!sources.includes(source)) {
      sources.push(source);
    }
  });
  return sources;
}

function getUrls(references: string[]) {
  return references.filter(
    (url) => url.startsWith('https://') || url.startsWith('http://')
  );
}

function getThreadIds(references: string[]) {
  return references.filter(
    (url) => !url.startsWith('https://') && !url.startsWith('http://')
  );
}

export async function parseBody(
  response: LLMPredictionResponse,
  { account, communityName }: { account: accounts; communityName: string }
): Promise<string> {
  // TODO: if is a url, show it, otherwise, it will be a threadId, we should build the url
  // TODO https urls should not be wrapped by <>
  const references = getReferences(response.sourceDocuments);
  const urls = getUrls(references);
  const threadIds = getThreadIds(references);
  const threads = await prisma.threads.findMany({
    where: {
      id: { in: threadIds },
    },
  });

  const threadUrls = threads.map((thread) => {
    return getThreadUrl({
      isSubDomainRouting: true,
      slug: thread.slug,
      incrementId: thread.incrementId,
      settings: {
        communityName,
        redirectDomain: account.redirectDomain as string | undefined,
      },
      LINEN_URL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://www.linen.dev',
    });
  });

  const refs = [...urls, ...threadUrls];

  if (refs.length > 0) {
    return [
      response.text,
      'References:',
      [...urls, ...threadUrls].map((source) => `- ${source}`).join('\n'),
    ].join('\n\n');
  }
  return response.text;
}

// TODO: follow up (replies)
