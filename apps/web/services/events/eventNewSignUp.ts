import { createUserEvent } from 'services/customerIo/trackEvents';
import { sendNotification } from 'services/slack';

export const eventSignUp = async (
  id: string,
  email: string,
  createdAt: Date,
  accountId?: string
) => {
  const promises: Promise<any>[] = [
    sendNotification(
      accountId
        ? `User ${email} signed up and joined community ${accountId}`
        : `User ${email} signed up`
    ),
    createUserEvent(id, email, createdAt),
  ];

  await Promise.allSettled(promises);
};
