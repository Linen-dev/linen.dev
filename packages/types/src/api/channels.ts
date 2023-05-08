import { z } from 'zod';
import { channelsIntegrationType, SerializedChannel } from '../channels';
import { patterns } from '../patterns';

export const createChannelSchema = z.object({
  channelName: z.string().regex(patterns.channelName),
  accountId: z.string().uuid(),
  slackChannelId: z.string().optional(),
  channelPrivate: z.boolean().optional(),
  usersId: z.array(z.string().uuid()).optional(),
});
export type createChannelType = z.infer<typeof createChannelSchema>;

export const updateChannelSchema = z.object({
  channelName: z.string().regex(patterns.channelName),
  channelId: z.string().uuid(),
  accountId: z.string().uuid(),
  channelPrivate: z.boolean().optional(),
});
export type updateChannelType = z.infer<typeof updateChannelSchema>;

export const deleteChannelSchema = z.object({
  channelId: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type deleteChannelType = z.infer<typeof deleteChannelSchema>;

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

export const archiveChannelSchema = z.object({
  channelId: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type archiveChannelType = z.infer<typeof archiveChannelSchema>;

export const getChannelMembersSchema = z.object({
  channelId: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type getChannelMembersType = z.infer<typeof getChannelMembersSchema>;

export const putChannelMembersSchema = z.object({
  channelId: z.string().uuid(),
  accountId: z.string().uuid(),
  usersId: z.array(z.string().uuid()),
});
export type putChannelMembersType = z.infer<typeof putChannelMembersSchema>;

export type findChannelsWithStats = (SerializedChannel & { stats: string })[];
