import nodemailer from 'nodemailer';
import { extractEmail, parseResponse } from './helper/parser';
import LinenSdk from '@linen/sdk';
import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import { stringify } from 'superjson';

const linenSdk = new LinenSdk({
  apiKey: process.env.INTERNAL_API_KEY!,
  type: 'internal',
  linenUrl: appendProtocol(getIntegrationUrl()),
});

export async function processEmailIntegration(
  {
    channelId,
    messageId,
    threadId,
    event,
    integration,
    id,
  }: any /* TODO: add types */
) {
  if (event === 'newThread') {
    return 'not implemented yet';
  }
  if (event === 'threadClosed') {
    return 'not implemented yet';
  }
  if (event === 'threadReopened') {
    return 'not implemented yet';
  }
  if (event === 'newMessage') {
    return await processNewMessage(messageId!, integration, event);
  }
}

async function processNewMessage(
  messageId: string,
  integration: any, // TODO: add types
  event: any // TODO: add types
) {
  const message = await linenSdk.getMessage({ messageId });

  if (!message) {
    return 'MessageNotFound';
  }
  if (message.externalMessageId) {
    return 'skip two-way sync due message is not from linen';
  }
  if (!message.threadId) {
    return 'thread not found';
  }

  const thread = await linenSdk.getThread({
    threadId: message.threadId,
    channelId: message.channelId,
  });

  if (!thread || !thread.externalThreadId) {
    return 'ThreadNotFound';
  }

  const lastReply = await linenSdk.findMessage({
    threadId: message.threadId,
    channelId: message.channelId,
    mustHave: ['externalMessageId'],
    orderBy: 'desc',
    sortBy: 'sentAt',
  });

  const data = {
    from: message.author?.displayName,
    to: thread.messages.find(Boolean)?.author?.displayName,
    body: message.body,
    title: thread.title,
    channelInbox: integration.externalId,
    ...(lastReply?.externalMessageId && {
      lastExternalMessageId: lastReply.externalMessageId,
    }),
  };

  const externalId = await sendMail({ event, data });
  return await linenSdk.updateMessage({
    messageId,
    externalMessageId: externalId,
  });
}

async function sendMail({
  event,
  data: { to, from, body, channelInbox, lastExternalMessageId, title },
}: {
  event: string;
  data: {
    from?: string | null;
    to?: string | null;
    body: string;
    channelInbox: string;
    lastExternalMessageId?: string | null;
    title?: string | null;
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

  if (!to) {
    return '"to" not found';
  }
  const sendResponse = await transporter.sendMail({
    ...(lastExternalMessageId && {
      inReplyTo: lastExternalMessageId,
    }),
    from: from ? `${from} ${channelInbox}` : channelInbox,
    to: extractEmail(to)?.join(),
    text: body,
    subject: `Re: ${title}`,
  });
  console.log(stringify(sendResponse));
  return parseResponse(sendResponse.response);
}
