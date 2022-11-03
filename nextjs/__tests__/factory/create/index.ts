import createAccount from './account';
import createChannel from './channel';
import createThread from './thread';

export default async function create(
  name: string,
  options?: object
): Promise<any> {
  switch (name) {
    case 'account':
      return createAccount(options);
    case 'channel':
      return createChannel(options);
    case 'thread':
      return createThread(options);
    default:
      return Promise.reject(new Error(`Unknown factory name: ${name}`));
  }
}
