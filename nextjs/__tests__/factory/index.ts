import buildMessage from './build/message';
import buildThread from './build/thread';
import buildResponse from './build/response';
import buildRequest from './build/request';
import buildAccount from './build/account';
import buildAuth from './build/auth';
import buildPermissions from './build/permissions';
import buildSettings from './build/settings';
import buildChannel from './build/channel';
import buildUser from './build/user';

export function build(name: string, options?: object): any {
  switch (name) {
    case 'request':
      return buildRequest(options);
    case 'response':
      return buildResponse(options);
    case 'thread':
      return buildThread(options);
    case 'message':
      return buildMessage(options);
    case 'account':
      return buildAccount(options);
    case 'user':
      return buildUser(options);
    case 'auth':
      return buildAuth(options);
    case 'permissions':
      return buildPermissions(options);
    case 'settings':
      return buildSettings(options);
    case 'channel':
      return buildChannel(options);
    default:
      throw new Error(`Unknown factory name: ${name}`);
  }
}
