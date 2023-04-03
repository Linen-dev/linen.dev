import { z } from 'zod';

export const deleteUserSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type deleteUserType = z.infer<typeof deleteUserSchema>;
