import request from 'superagent';
import prisma from './client';
import { createMessage } from './lib/slack';

const channels = {};

//Papercups public
const slackSyncInfo = {
  teamId: 'T018254HCUV',
  channels: [
    'C0189MJHKMJ', //general
    'C0183G2HFNE', //papercups
  ],
};

export const fetchConversations = async (channel: string) => {
  const url = 'https://slack.com/api/conversations.history';
  const token = 'xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn';

  const response = await request
    .get(url + '?channel=' + channel)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const saveMessages = async (messages: any[], channelId: string) => {
  const params = messages
    .filter((message) => message.type === 'message')
    .filter(
      (message) =>
        message.subtype === undefined || message.subtype === 'thread_broadcast'
    )
    .map((message) => {
      const slackThreadTs = message.thread_ts || message.ts;
      return {
        body: message.text,
        sentAt: new Date(parseFloat(message.ts) * 1000),
        channelId: channelId,
        slackThreadTs,
      };
    });

  try {
    const messages = [];
    for (let param of params) {
      messages.push(await createMessage(param));
    }

    return messages;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const joinChannel = async (channel: string) => {
  const url = 'https://slack.com/api/conversations.join';
  const token = 'xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn';

  const response = await request
    .post(url)
    .send({ channel })
    .set('Authorization', 'Bearer ' + token);

  return response;
};
