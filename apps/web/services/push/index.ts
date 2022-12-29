import request from 'superagent';
import { getPushUrlSSR } from 'utilities/domain';

const token = process.env.PUSH_SERVICE_KEY;

type PushType = {
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
  return request.post(`${getPushUrlSSR()}/api/message`).send({
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
  return request.post(`${getPushUrlSSR()}/api/channel`).send({
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
  return request.post(`${getPushUrlSSR()}/api/user`).send({
    user_id: userId,
    thread_id: threadId,
    channel_id: channelId,
    is_mention: true,
    mention_type: mentionType,
    token,
  });
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
  return request.post(`${getPushUrlSSR()}/api/community`).send({
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
  });
};
