import request from 'superagent';

const token = process.env.COMPANY_SLACK_BOT_TOKEN || '';
// send notification to events-and-metrics channel
export const sendNotification = async (message: string) => {
  if (!token) {
    console.log('no token');
    return;
  }

  const url = 'https://slack.com/api/chat.postMessage?';

  const response = await request
    .post(
      url +
        'channel=events-and-metrics' +
        `&text=${encodeURIComponent(message)}`
    )
    .set('Authorization', 'Bearer ' + token);

  return response;
};
