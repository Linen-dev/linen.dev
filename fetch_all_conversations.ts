import { Prisma } from '@prisma/client';
import { create } from 'domain';
import request from 'superagent';
import prisma from './client';
import {
  createManyUsers,
  createMessage,
  findOrCreateThread,
  findOrCreateUser,
  findUser,
} from './lib/slack';

const channels = {};

//Papercups public
const slackSyncInfo = {
  teamId: 'T018254HCUV',
  channels: [
    'C0189MJHKMJ', //general
    'C0183G2HFNE', //papercups
  ],
};
//example message conversation.history
// {
//   "client_msg_id": "a3184f22-caf9-44cb-ba73-e2b519179877",
//   "type": "message",
//   "text": "```testing one two three this is markdown```",
//   "user": "U0174S5F9E3",
//   "ts": "1645125355.730889",
//   "team": "T017CSH2R70",
//   "blocks": [
//       {
//           "type": "rich_text",
//           "block_id": "GSh7",
//           "elements": [
//               {
//                   "type": "rich_text_preformatted",
//                   "elements": [
//                       {
//                           "type": "text",
//                           "text": "testing one two three this is markdown"
//                       }
//                   ],
//                   "border": 0
//               }
//           ]
//       }
//   ]
// },
// example message conversation.history with replies
// {
//   "client_msg_id": "a3184f22-caf9-44cb-ba73-e2b519179877",
//   "type": "message",
//   "text": "```testing one two three this is markdown```",
//   "user": "U0174S5F9E3",
//   "ts": "1645125355.730889",
//   "team": "T017CSH2R70",
//   "blocks": [
//       {
//           "type": "rich_text",
//           "block_id": "GSh7",
//           "elements": [
//               {
//                   "type": "rich_text_preformatted",
//                   "elements": [
//                       {
//                           "type": "text",
//                           "text": "testing one two three this is markdown"
//                       }
//                   ],
//                   "border": 0
//               }
//           ]
//       }
//   ],
//   "thread_ts": "1645125355.730889",
//   "reply_count": 1,
//   "reply_users_count": 1,
//   "latest_reply": "1645126564.548839",
//   "reply_users": [
//       "U0174S5F9E3"
//   ],
//   "is_locked": false,
//   "subscribed": false
// },

export const fetchConversations = async (channel: string) => {
  const url = 'https://slack.com/api/conversations.history';
  const token = 'xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn';

  const response = await request
    .get(url + '?channel=' + channel)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const saveMessages = async (
  messages: any[],
  channelId: string,
  slackChannelId: string
) => {
  const params = messages
    .filter((message) => message.type === 'message')
    .filter(
      (message) =>
        message.subtype === undefined || message.subtype === 'thread_broadcast'
    )
    .map((message) => {
      return {
        body: message.text,
        sentAt: new Date(parseFloat(message.ts) * 1000),
        channelId: channelId,
        slackThreadTs: message.thread_ts,
        slackUserId: message.user,
        usersId: null,
      } as any;
    });

  try {
    const messages = [];
    //TODO: Clean up and refactor
    for (let param of params) {
      if (!!param.slackThreadTs) {
        const replies = await fetchReplies(param.slackThreadTs, slackChannelId);
        console.log({ replies: replies.body });
        const repliesParams = replies.body.messages
          .filter(
            //don't create the original thread since it is already in DB
            (m: { ts: any }) => m.ts !== param.slackThreadTs
          )
          .map((m) => {
            return {
              body: m.text,
              sentAt: new Date(parseFloat(m.ts) * 1000),
              slackThreadTs: param.slackThreadTs,
              slackUserId: m.user,
              channelId: channelId,
            };
          });
        console.log({ repliesParams });

        let thread = await findOrCreateThread({
          slackThreadTs: param.slackThreadTs,
          channelId: channelId,
        });

        for (let replyParam of repliesParams) {
          const user = await findUser(replyParam.slackUserId);
          replyParam.usersId = user?.id;
          replyParam.slackThreadId = thread.id;
          await createMessage(replyParam);
        }
      }

      const user = await findUser(param.slackUserId);
      param.usersId = user?.id;
      messages.push(await createMessage(param));
    }

    return messages;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const fetchReplies = async (threadTs: string, channel: string) => {
  console.log({ threadTs });
  console.log({ channel });
  const url = 'https://slack.com/api/conversations.replies';
  const token = 'xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn';

  const response = await request
    .get(url + '?channel=' + channel + '&ts=' + threadTs)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

export const saveUsers = async (users: any[], accountId: string) => {
  const params = users.map((user) => {
    const profile = user.profile;
    const name =
      profile.display_name ||
      profile.display_name_normalized ||
      profile.real_name ||
      profile.real_name_normalized;
    const profileImageUrl = profile.image_original;
    return {
      displayName: name,
      slackUserId: user.id,
      profileImageUrl,
      accountsId: accountId,
    };
  });

  const result = await createManyUsers({ data: params, skipDuplicates: true });
};

export const listUsers = async () => {
  const url = 'https://slack.com/api/users.list';
  const token = 'xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn';

  return await request.get(url).set('Authorization', 'Bearer ' + token);
};

export const getUserProfile = async (userId: string) => {
  const url = 'https://slack.com/api/users.info?user=' + userId;
  const token = 'xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn';

  return await request.get(url).set('Authorization', 'Bearer ' + token);
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
