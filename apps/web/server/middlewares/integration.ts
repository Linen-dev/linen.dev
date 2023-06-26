import { NextFunction, AuthedRequestWithTenant } from '@linen/types';
import { Unauthorized, Forbidden } from 'server/exceptions';
import { stringify } from 'superjson';
import { ApiKeysService } from 'services/api-keys';

function getInternalApiKey(req: any) {
  const authorizationHeader =
    req.headers instanceof Headers
      ? req.headers.get('x-api-internal')
      : req.headers['x-api-internal'];

  if (!authorizationHeader) return null;
  return decodeURIComponent(authorizationHeader);
}

function getApiKey(req: any) {
  const authorizationHeader =
    req.headers instanceof Headers
      ? req.headers.get('x-api-key')
      : req.headers['x-api-key'];

  if (!authorizationHeader) return null;
  return decodeURIComponent(authorizationHeader);
}

export default function integrationMiddleware(_?: never) {
  return async (req: AuthedRequestWithTenant, _: any, next: NextFunction) => {
    try {
      const internalApiKeyRaw = getInternalApiKey(req);
      const apiKeyRaw = getApiKey(req);
      if (!internalApiKeyRaw && !apiKeyRaw) {
        return next(new Unauthorized());
      }

      if (internalApiKeyRaw) {
        if (!process.env.INTERNAL_API_KEY) {
          return next(new Error());
        }
        if (process.env.INTERNAL_API_KEY !== internalApiKeyRaw) {
          return next(new Unauthorized());
        }
        return next();
      }

      if (apiKeyRaw) {
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
      }

      return next(new Error());
    } catch (error) {
      console.error(stringify(error));
      return next(new Unauthorized());
    }
  };
}
