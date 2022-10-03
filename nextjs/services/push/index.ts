import request from 'superagent';

const token = process.env.PUSH_SERVICE_KEY;
const pushURL = process.env.PUSH_SERVICE_URL;

type PushType = {
  channelId: string;
  threadId: string;
  messageId: string;
  imitationId?: string;
  isThread: boolean;
  isReply: boolean;
};

export type PushMessageType = {
  channel_id: string;
  thread_id: string;
  message_id: string;
  imitation_id: string;
  is_thread: boolean;
  is_reply: boolean;
};

export const push = ({
  channelId,
  threadId,
  messageId,
  imitationId,
  isThread,
  isReply,
}: PushType) => {
  return request.post(`${pushURL}/api/message`).send({
    channel_id: channelId,
    thread_id: threadId,
    message_id: messageId,
    imitation_id: imitationId,
    is_thread: isThread,
    is_reply: isReply,
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
}: PushType) => {
  return request.post(`${pushURL}/api/channel`).send({
    channel_id: channelId,
    thread_id: threadId,
    message_id: messageId,
    imitation_id: imitationId,
    is_thread: isThread,
    is_reply: isReply,
    token,
  });
};
