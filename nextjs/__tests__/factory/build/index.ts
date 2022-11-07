import buildMessage from './message';
import buildThread from './thread';
import buildResponse from './response';
import buildRequest from './request';
import buildAccount from './account';
import buildAuth from './auth';
import buildPermissions from './permissions';
import buildSettings from './settings';
import buildChannel from './channel';
import buildUser from './user';

export default function build(name: string, options?: object): any {
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
