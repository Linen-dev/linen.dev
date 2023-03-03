import { z } from 'zod';
import { channelsIntegrationType } from '..';
import { patterns } from '../patterns';

export const createChannelSchema = z.object({
  channelName: z.string().regex(patterns.channelName),
  accountId: z.string().uuid(),
  slackChannelId: z.string().optional(),
});
export type createChannelType = z.infer<typeof createChannelSchema>;

export const bulkHideChannelsSchema = z.object({
  channels: z.array(z.object({ id: z.string().uuid(), hidden: z.boolean() })),
  accountId: z.string().uuid(),
});
export type bulkHideChannelsType = z.infer<typeof bulkHideChannelsSchema>;

export const setDefaultChannelSchema = z.object({
  accountId: z.string().uuid(),
  originalChannelId: z.string().uuid().optional(),
  channelId: z.string().uuid(),
});
export type setDefaultChannelType = z.infer<typeof setDefaultChannelSchema>;

export const getChannelIntegrationsSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
});
export type getChannelIntegrationsType = z.infer<
  typeof getChannelIntegrationsSchema
>;

export const postChannelIntegrationsSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  type: z.enum([
    channelsIntegrationType.EMAIL,
    channelsIntegrationType.GITHUB,
    channelsIntegrationType.LINEAR,
  ]),
  externalId: z.string().optional(),
  data: z.any(),
});
export type postChannelIntegrationsType = z.infer<
  typeof postChannelIntegrationsSchema
>;

export const createDmSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type createDmType = z.infer<typeof createDmSchema>;
