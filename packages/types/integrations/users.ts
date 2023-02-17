import { z } from 'zod';

export const userPostSchema = z.object({
  externalUserId: z.string().min(1),
  accountsId: z.string().uuid(),
  displayName: z.string().min(1),
  profileImageUrl: z.string().min(1).optional(),
});
export type userPostType = z.infer<typeof userPostSchema>;

export const userGetSchema = z.object({
  externalUserId: z.string().min(1),
  accountsId: z.string().uuid(),
});
export type userGetType = z.infer<typeof userGetSchema>;
