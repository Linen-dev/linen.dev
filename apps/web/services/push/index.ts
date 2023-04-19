import request from 'superagent';
import { getPushUrlSSR } from '@linen/utilities/domain';
import { ChannelType } from '@linen/database';

const token = process.env.PUSH_SERVICE_KEY;

export type PushType = {
  channelId: string;
  threadId: string;
  messageId: string;
  imitationId?: string;
  isThread: boolean;
  isReply: boolean;
  message?: string;
  thread?: string;
};

export type PushMessageType = {
  channel_id: string;
  thread_id: string;
  message_id: string;
  imitation_id: string;
  is_thread: boolean;
  is_reply: boolean;
  mention_type?: string;
  message?: string;
  thread?: string;
};
export type CommunityPushType = PushMessageType & {
  community_id: string;
};

export const push = ({
  channelId,
  threadId,
  messageId,
  imitationId,
  isThread,
  isReply,
  message,
  thread,
}: PushType) => {
  return request
    .post(`${getPushUrlSSR()}/api/message`)
    .send({
      channel_id: channelId,
      thread_id: threadId,
      message_id: messageId,
      imitation_id: imitationId,
      is_thread: isThread,
      is_reply: isReply,
      message,
      thread,
      token,
    })
    .then((e) => e.status);
};

export const pushChannel = ({
  channelId,
  threadId,
  messageId,
  imitationId,
  isThread,
  isReply,
  message,
  thread,
}: PushType) => {
  return request
    .post(`${getPushUrlSSR()}/api/channel`)
    .send({
      channel_id: channelId,
      thread_id: threadId,
      message_id: messageId,
      imitation_id: imitationId,
      is_thread: isThread,
      is_reply: isReply,
      message,
      thread,
      token,
    })
    .then((e) => e.status);
};

export const pushUser = async ({
  channelId,
  threadId,
  messageId,
  imitationId,
  isThread,
  isReply,
  message,
  thread,
  userId,
}: PushType & { userId: string }) => {
  const e = await request.post(`${getPushUrlSSR()}/api/user`).send({
    user_id: userId,
    channel_id: channelId,
    thread_id: threadId,
    message_id: messageId,
    imitation_id: imitationId,
    is_thread: isThread,
    is_reply: isReply,
    message,
    thread,
    token,
  });
  return e.status;
};

export const pushUserMention = ({
  userId,
  threadId,
  channelId,
  mentionType,
}: {
  userId: string;
  threadId: string;
  channelId: string;
  mentionType: string;
}) => {
  return request
    .post(`${getPushUrlSSR()}/api/user`)
    .send({
      user_id: userId,
      thread_id: threadId,
      channel_id: channelId,
      is_mention: true,
      mention_type: mentionType,
      token,
    })
    .then((e) => e.status);
};

export const pushCommunity = ({
  communityId,
  channelId,
  threadId,
  messageId,
  imitationId,
  isThread,
  isReply,
  message,
  thread,
}: {
  communityId: string;
} & PushType) => {
  if (!communityId) return Promise.resolve();
  return request
    .post(`${getPushUrlSSR()}/api/community`)
    .send({
      community_id: communityId,
      channel_id: channelId,
      thread_id: threadId,
      message_id: messageId,
      imitation_id: imitationId,
      is_thread: isThread,
      is_reply: isReply,
      message,
      thread,
      token,
    })
    .then((e) => e.status);
};

export function resolvePush({
  channel,
  userId,
  event,
  communityId,
}: {
  channel: {
    id: string;
    memberships: {
      archived: boolean | null;
      user: {
        id: string;
        authsId: string | null;
      };
    }[];
    type: ChannelType | null;
  } | null;
  userId: string | undefined;
  event: any;
  communityId: string;
}) {
  const promises: Promise<any>[] = [];

  if (channel?.type === ChannelType.DM) {
    channel.memberships.forEach((member) => {
      if (member.user.id !== userId && member.user.authsId) {
        promises.push(pushUser({ ...event, userId: member.user.authsId }));
      }
    });
  } else if (channel?.type === ChannelType.PRIVATE) {
    channel.memberships.forEach((member) => {
      if (
        member.user.id !== userId &&
        member.user.authsId &&
        !member.archived
      ) {
        promises.push(pushUser({ ...event, userId: member.user.authsId }));
      }
    });
  } else {
    promises.push(
      ...[
        // public push
        push(event),
        pushChannel(event),
        pushCommunity({ ...event, communityId }),
      ]
    );
  }
  return promises;
}
