import { createAccountEvent } from 'services/customerIo/trackEvents';
import { sendNotification } from 'services/slack';
import { notifyFeed } from 'services/feed/notifyFeed';
import { createTypesenseOnNewCommunity } from 'queue/jobs';

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
    createTypesenseOnNewCommunity({ accountId: id }),
    createAccountEvent(email, id),
    sendNotification(
      `New community created by ${email}: https://www.linen.dev/s/${slackDomain}`
    ),
    notifyFeed(id),
  ]);
}
