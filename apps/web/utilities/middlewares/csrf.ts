import { z } from 'zod';
import { InvalidCsrf } from 'utilities/exceptions';
import { verifyCSRFToken } from 'utilities/auth/server/csrf';

const schema = z.object({
  csrfToken: z.string().min(1),
});

export const csrfMiddleware = async (req: any, res: any, next: any) => {
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
