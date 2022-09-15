import request from 'superagent';

const token = process.env.PUSH_SERVICE_KEY;
const pushURL = process.env.PUSH_SERVICE_URL;

interface pushBody {
  threadId: string;
  messageId: string;
}

export const push = ({ channelId, body }: { channelId: string; body: any }) => {
  return request
    .post(`${pushURL}/api/messages`)
    .send({ channel_id: channelId, body, token });
};
