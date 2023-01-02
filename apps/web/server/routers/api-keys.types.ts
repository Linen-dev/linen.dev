import { z } from 'zod';

export const createKeySchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1),
  scope: z.array(z.string().min(1)).optional(),
});

export type createKeyType = z.infer<typeof createKeySchema>;

export const revokeKeySchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type revokeKeyType = z.infer<typeof revokeKeySchema>;
