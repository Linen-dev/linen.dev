import { createAccountEvent } from 'services/customerIo/trackEvents';
import { sendNotification } from 'services/slack';
import { notifyFeed } from 'services/feed/notifyFeed';

export async function eventNewCommunity({
  email,
  id,
  slackDomain,
}: {
  email: string;
  id: string;
  slackDomain?: string;
}) {
  await Promise.allSettled([
    createAccountEvent(email, id),
    sendNotification(
      `New community created by ${email}: https://www.linen.dev/s/${slackDomain}`
    ),
    notifyFeed(id),
  ]);
}
