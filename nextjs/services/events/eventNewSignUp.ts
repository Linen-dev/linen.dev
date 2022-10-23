import { trackSignUp } from 'services/customerIo';
import { sendNotification } from 'services/slack';

export const eventSignUp = async (
  id: string,
  email: string,
  createdAt: Date
) => {
  const promises: Promise<any>[] = [
    sendNotification('Email created: ' + email),
    trackSignUp(id, email, createdAt),
  ];

  await Promise.allSettled(promises);
};
