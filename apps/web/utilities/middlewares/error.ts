import { ZodError } from 'zod';

export const onError = (error: any, req: any, res: any, next: any) => {
  try {
    error.status = error instanceof ZodError ? 400 : error.status || 500;

    const path = !!req.baseUrl ? req.baseUrl + req.path : req.url;

    console.error(
      `[${req.method}] ${path} >> StatusCode:: ${error.status}, Message:: ${error.message}`
    );

    if (error.status === 500) {
      error.message = 'Something went wrong';
    }

    res.status(error.status).json({ message: error.message });
  } catch (error) {
    next(error);
  }
};

export const onNoMatch = (req: any, res: any) => {
  res.status(404).end('Not Found');
};
