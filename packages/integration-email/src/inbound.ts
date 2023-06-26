import { Router } from 'express';
import LinenSdk from '@linen/sdk';
import { cleanUpQuotedEmail, extractEmail } from './helper/parser';
import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import { stringify } from 'superjson';

const linenSdk = new LinenSdk({
  apiKey: process.env.INTERNAL_API_KEY!,
  type: 'internal',
  linenUrl: appendProtocol(getIntegrationUrl()),
});

export const inboundRouter = Router();

inboundRouter.post(`/api/bridge/email/in`, async (req, res, next) => {
  if (req.headers['x-api-internal'] !== process.env.INTERNAL_API_KEY) {
    next(new Error('missing api-key'));
  }
  try {
    console.log(stringify(req.body));
    await handleInbound(req.body);
    res.send(200);
  } catch (error) {
    console.error(stringify(error));
    res.send(500);
  }
});

async function findChannel(emails: string[]) {
  if (!emails || !emails.length) {
    return null;
  }
  for (const email of emails) {
    const channel = await linenSdk.getChannel({ integrationId: email });
    if (channel) {
      return channel;
    }
  }
  return null;
}

async function handleInbound(reqBody: any) {
  const spam = reqBody.headerLines.find(
    (h: any) => h.key === 'x-ses-spam-verdict'
  );
  if (spam && spam.line.indexOf('FAIL') > -1) {
    // skip spam
    return;
  }
  const virus = reqBody.headerLines.find(
    (h: any) => h.key === 'x-ses-virus-verdict'
  );
  if (virus && virus.line.indexOf('FAIL') > -1) {
    // skip virus
    return;
  }

  const forwarded = reqBody.headerLines.find(
    (h: any) => h.key === 'x-forwarded-to'
  );

  const destination: string[] = [];
  if (forwarded && forwarded.line) {
    const emails = extractEmail(forwarded.line);
    if (emails) {
      destination.push(...emails);
    }
  }
  const externalId = reqBody.messageId;
  const to = extractEmail(reqBody.to.text);
  if (to) {
    destination.push(...to);
  }
  const from = reqBody.from.text;
  const body = cleanUpQuotedEmail(reqBody.text || reqBody.html); // TODO: parse html to text
  const title = reqBody.subject;

  // "to" must match a channel integration
  const channel = await findChannel(destination);
  if (!channel) {
    console.warn('channel not found');
    return;
  }

  // "from" must find or create a new user
  const user = await linenSdk.findOrCreateUser({
    accountsId: channel.accountId,
    displayName: from,
    externalUserId: from,
  });

  // "inReplyTo" must find or create a thread
  const message =
    !!reqBody.inReplyTo &&
    (await linenSdk.findMessage({
      externalMessageId: reqBody.inReplyTo,
      channelId: channel.id,
    }));
  // if message exists, we create a new message
  if (message && message.threadId) {
    await linenSdk.createNewMessage({
      accountId: channel.accountId,
      authorId: user.id,
      body,
      channelId: channel.id,
      externalMessageId: externalId,
      threadId: message.threadId,
    });
  }
  // otherwise we create a new thread with a message
  else {
    await linenSdk.createNewThread({
      accountId: channel.accountId,
      authorId: user.id,
      body,
      channelId: channel.id,
      externalThreadId: externalId,
      title,
    });
  }
}
