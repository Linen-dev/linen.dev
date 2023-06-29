import { z } from 'zod';

export const matrixGetAllSchema = z.object({
  accountId: z.string().uuid(),
});
export type matrixGetAllType = z.infer<typeof matrixGetAllSchema>;

export const matrixPostSchema = z.object({
  accountId: z.string().uuid(),
  matrixUrl: z.string().url(),
  enabled: z.coerce.boolean(),
  matrixToken: z.string().optional(),
});
export type matrixPostType = z.infer<typeof matrixPostSchema>;

export const matrixPutSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  matrixUrl: z.string().url().optional(),
  enabled: z.coerce.boolean().optional(),
  matrixToken: z.string().optional(),
});
export type matrixPutType = z.infer<typeof matrixPutSchema>;

export const matrixDeleteSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type matrixDeleteType = z.infer<typeof matrixDeleteSchema>;

export type integrationMatrixType = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  matrixUrl: string;
  enabled: boolean;
};
