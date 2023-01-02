import { z } from 'zod';
import { AccountType } from '@linen/types';

export const updateAccountSchema = z.object({
  homeUrl: z.string().url().optional(),
  docsUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  redirectDomain: z.string().url().optional(),
  brandColor: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  anonymizeUsers: z.boolean().optional(),
  communityInviteUrl: z.string().url().optional(),
  type: z.enum([AccountType.PRIVATE, AccountType.PUBLIC]).optional(),
});
export type updateAccountType = z.infer<typeof updateAccountSchema>;
