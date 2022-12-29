import { z } from 'zod';
import { InvalidCsrf } from 'server/exceptions';
import { verifyCSRFToken } from 'utilities/auth/server/csrf';
import { Request, Response, NextFunction } from 'server/types';

const schema = z.object({
  csrfToken: z.string().min(1),
});

export default function csrfMiddleware(_?: never) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { csrfToken } = schema.parse(req.body);

      const csrfTokenVerified = verifyCSRFToken(csrfToken);

      if (csrfTokenVerified) {
        return next();
      } else {
        return next(new InvalidCsrf());
      }
    } catch (error) {
      return next(error);
    }
  };
}
