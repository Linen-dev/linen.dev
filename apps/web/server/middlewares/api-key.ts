import { AuthedRequestWithTenant, NextFunction } from '@linen/types';
import { Forbidden, Unauthorized } from 'server/exceptions';
import { ApiKeysService } from 'services/api-keys';

function getApiKey(req: any) {
  const authorizationHeader =
    req.headers instanceof Headers
      ? req.headers.get('x-api-key')
      : req.headers['x-api-key'];

  if (!authorizationHeader) return null;
  return decodeURIComponent(authorizationHeader);
}

export default function apiKeyMiddleware(_?: never) {
  return async (req: AuthedRequestWithTenant, _: any, next: NextFunction) => {
    try {
      const apiKeyRaw = getApiKey(req);
      if (!apiKeyRaw) {
        return next(new Unauthorized());
      }

      const apiKey = await ApiKeysService.getAccountByApiKey({
        apiKey: apiKeyRaw,
      });
      if (!apiKey) {
        return next(new Unauthorized());
      }

      // we could validate scope here
      req.tenant = apiKey.account;
      if (!req.tenant) {
        return next(new Forbidden());
      }

      req.tenant_api = {
        id: apiKey.id,
        name: apiKey.name,
        scope: apiKey.scope || {},
      };

      return next();
    } catch (error) {
      console.error(error);
      return next(new Unauthorized());
    }
  };
}
