import { z } from 'zod';
import { AccountType } from '@linen/types';

export const updateAccountSchema = z.object({
  description: z.string().optional(),
  homeUrl: z.string().url().or(z.literal('')).optional(),
  docsUrl: z.string().url().or(z.literal('')).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  logoSquareUrl: z.string().url().or(z.literal('')).optional(),
  redirectDomain: z.string().url().or(z.literal('')).optional(),
  brandColor: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  anonymizeUsers: z.boolean().optional(),
  communityInviteUrl: z.string().url().or(z.literal('')).optional(),
  type: z.enum([AccountType.PRIVATE, AccountType.PUBLIC]).optional(),
});
export type updateAccountType = z.infer<typeof updateAccountSchema>;

export const integrationDiscordSchema = z.object({
  accountId: z.string().uuid(),
  discordServerId: z.string().min(1),
  botToken: z.string().min(1),
});
export type integrationDiscordType = z.infer<typeof integrationDiscordSchema>;
