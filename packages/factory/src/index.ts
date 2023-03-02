import buildFactory from './build';
import createFactory from './create';
import createAccount from './create/account';
import createAuth from './create/auth';
import createChannel from './create/channel';
import createMessage from './create/message';
import createThread from './create/thread';
import createUser from './create/user';

export function build(name: string, options?: object): any {
  return buildFactory(name, options);
}

export async function create(name: string, options?: object): Promise<any> {
  return createFactory(name, options);
}

export {
  createAccount,
  createAuth,
  createChannel,
  createMessage,
  createThread,
  createUser,
};
