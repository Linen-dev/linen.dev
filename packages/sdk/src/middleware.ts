function getInternalApiKey(req: any) {
  const authorizationHeader = req.headers['x-api-internal'];
  if (!authorizationHeader) return null;
  return decodeURIComponent(authorizationHeader);
}

export function integrationMiddleware(INTERNAL_API_KEY: string) {
  return async (req: any, _: any, next: any) => {
    try {
      const apiKeyRaw = getInternalApiKey(req);
      if (!apiKeyRaw) {
        return next(new Error('missing api key'));
      }
      if (INTERNAL_API_KEY !== apiKeyRaw) {
        return next(new Error('api key does not match'));
      }
      return next();
    } catch (error) {
      console.error(error);
      return next(new Error('internal server error'));
    }
  };
}
