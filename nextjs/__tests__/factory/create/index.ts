import createAccount from './account';
import createAuth from './auth';
import createChannel from './channel';
import createMessage from './message';
import createThread from './thread';
import createUser from './user';

export default async function create(
  name: string,
  options?: object
): Promise<any> {
  switch (name) {
    case 'account':
      return createAccount(options);
    case 'auth':
      return createAuth(options);
    case 'channel':
      return createChannel(options);
    case 'message':
      return createMessage(options);
    case 'thread':
      return createThread(options);
    case 'user':
      return createUser(options);
    default:
      return Promise.reject(new Error(`Unknown factory name: ${name}`));
  }
}
