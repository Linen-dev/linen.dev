import { z } from 'zod';
import { Roles } from '../roles';

export const deleteUserSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type deleteUserType = z.infer<typeof deleteUserSchema>;

export const putUserSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
});
export type putUserType = z.infer<typeof putUserSchema>;
