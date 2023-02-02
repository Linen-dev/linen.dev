import { Router } from 'express';
import LinenApi, { integrationMiddleware } from '@linen/bridge-api';
import { appendProtocol } from 'utilities/url';
import { getLinenUrl } from 'utilities/domain';
import { v4 } from 'uuid';
import nodemailer from 'nodemailer';
import { cleanUpQuotedEmail, extractEmail } from './parser';

const linenApi = new LinenApi(
  process.env.INTERNAL_API_KEY!,
  appendProtocol(getLinenUrl())
);

const prefix = '/api/bridge/email';

export const bridgeEmailRouter = Router()
  .use(integrationMiddleware(process.env.INTERNAL_API_KEY!))
  .post(`${prefix}/in`, async (req, res) => {
    try {
      console.log('handleInbound', req.body);
      await handleInbound(req.body);
      res.send(200);
    } catch (error) {
      console.error(error);
      res.send(500);
    }
  })
  .post(`${prefix}/out`, async (req, res) => {
    try {
      console.log('handleOutbound', req.body);
      await handleOutbound(req.body);
      res.send(200);
    } catch (error) {
      console.error(error);
      res.send(500);
    }
  });

async function findChannel(params: RegExpMatchArray | null) {
  if (!params) return null;
  for (const to of params) {
    const channel = await linenApi.getChannel(to);
    if (channel) return channel;
  }
  return null;
}

async function findThread(ids: string[], channelId: string) {
  if (!ids || !ids.length) return null;
  for (const id of ids) {
    const thread = await linenApi.getThread(id, channelId);
    if (thread) return thread;
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

  const externalId = decodeURIComponent(reqBody.messageId);
  const toArray = extractEmail(reqBody.to.text);
  const from = reqBody.from.text;
  const body = cleanUpQuotedEmail(reqBody.text || reqBody.html); // TODO: parse html to text
  const title = reqBody.subject;
  const references: string[] = reqBody.references;

  // "to" must match a channel integration
  const channel = await findChannel(toArray);
  if (!channel) {
    console.warn('channel not found');
    return;
  }

  // "from" must find or create a new user
  const user = await linenApi.findOrCreateUser({
    accountsId: channel.accountId,
    displayName: from,
    externalUserId: from,
  });

  // "externalId" must find or create a thread
  const thread = await findThread(references, channel.id);
  // if thread exists, we create a new message
  if (thread) {
    await linenApi.createNewMessage({
      accountId: channel.accountId,
      authorId: user.id,
      body,
      channelId: channel.id,
      externalMessageId: v4(),
      threadId: thread.id,
    });
  }
  // otherwise we create a new thread with a message
  else {
    await linenApi.createNewThread({
      accountId: channel.accountId,
      authorId: user.id,
      body,
      channelId: channel.id,
      externalThreadId: externalId,
      title,
    });
  }
}

async function handleOutbound({
  event,
  data: { to, from, body, channelInbox, externalThreadId, title },
}: {
  event: string;
  data: {
    from: string;
    to: string;
    body: string;
    channelInbox: string;
    externalThreadId: string;
    title: string;
  };
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_BRIDGE_HOST!,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_BRIDGE_USER!,
      pass: process.env.EMAIL_BRIDGE_PASS!,
    },
  });
  const sendResponse = await transporter.sendMail({
    inReplyTo: externalThreadId,
    from: from ? `${from} ${channelInbox}` : channelInbox,
    to: extractEmail(to)?.join(),
    text: body,
    subject: `Re: ${title}`,
  });
  console.log(sendResponse);
}
