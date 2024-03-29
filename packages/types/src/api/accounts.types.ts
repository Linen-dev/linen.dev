import { z } from 'zod';
import { patterns } from '../patterns';
import { AccountType, ChatType, AnonymizeType } from '../accounts';
import { NewChannelsConfig } from '../channels';

export const createAccountSchema = z.object({
  name: z.string().regex(patterns.communityName).optional(),
  description: z.string().max(500).optional(),
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
  faviconUrl: z.string().url().or(z.literal('')).optional(),
  redirectDomain: z.string().or(z.literal('')).optional(),
  accountId: z.string().uuid(),
  brandColor: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  anonymizeUsers: z.boolean().optional(),
  anonymize: z.nativeEnum(AnonymizeType).optional(),
  type: z.nativeEnum(AccountType).optional(),
  chat: z.nativeEnum(ChatType).optional(),
  newChannelsConfig: z.nativeEnum(NewChannelsConfig).optional(),
  tags: z.array(z.string()).optional(),
});
export type updateAccountType = z.infer<typeof updateAccountSchema>;
