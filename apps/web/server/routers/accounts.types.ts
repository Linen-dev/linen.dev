import { z } from 'zod';
import { AccountType, ChatType, patterns } from '@linen/types';

export const createAccountSchema = z.object({
  name: z.string().regex(patterns.communityName).optional(),
  slackDomain: z.string().regex(patterns.communityPath).optional(),
  channels: z.string().regex(patterns.channelName).array().optional(),
  members: z.string().email().array().optional(),
});
export type createAccountType = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  description: z.string().optional(),
  homeUrl: z.string().url().or(z.literal('')).optional(),
  docsUrl: z.string().url().or(z.literal('')).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  logoSquareUrl: z.string().url().or(z.literal('')).optional(),
  redirectDomain: z.string().or(z.literal('')).optional(),
  accountId: z.string().uuid(),
  brandColor: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  anonymizeUsers: z.boolean().optional(),
  communityInviteUrl: z.string().url().or(z.literal('')).optional(),
  type: z.enum([AccountType.PRIVATE, AccountType.PUBLIC]).optional(),
  chat: z.enum([ChatType.MANAGERS, ChatType.MEMBERS, ChatType.NONE]).optional(),
  newChannelsConfig: z.enum(['HIDDEN', 'NOT_HIDDEN']).optional(),
});
export type updateAccountType = z.infer<typeof updateAccountSchema>;
